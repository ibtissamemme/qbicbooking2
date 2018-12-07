import { ViewMeetingPage } from './../../pages/view-meeting/view-meeting';
import { ModalController } from 'ionic-angular';
import { HomePage } from './../../pages/home/home';
import { MeetingList } from './../../app/shared/meetingList';
import { AdminService } from './../../services/admin.service';
import { States, Meeting } from './../../app/shared/meeting';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as moment from "moment";
import { Events } from 'ionic-angular';

export enum ButtonStates {
  FREE = 'primary',
  OCCUPIED = 'danger',
  DISABLED = 'disabled',
  TAPPED = 'primary-light',
  OUT_OF_RANGE = 'out-of-range'
};

@Component({
  selector: "hour-scroll-button",
  templateUrl: "hour-scroll-button.html",
  encapsulation: ViewEncapsulation.None
})
export class HourScrollButtonComponent {
  @Input() date: moment.Moment;
  @Input() meeting: Meeting;
  @Input() state: States;

  @Input() upperRange: moment.Moment;

  buttonColor: string = "primary";
  hourScrollInterval: number;
  private meetingList: MeetingList;
  private tappedTimeArray: moment.Moment[];
  private attachedMeeting: Meeting;
  private buttonStatus: ButtonStates = ButtonStates.FREE;
  // flag to disabled booking from the tablet
  private isBookingEnabled: boolean = true;


  constructor(private adminService: AdminService, public events: Events, private modalCtrl: ModalController) {
    // this.buttonColor = this.getStateColor();
    this.hourScrollInterval = this.adminService.hourScrollInterval;
    this.adminService.meetingList$.subscribe((data) => {
      if (!data) {
        return;
      }
      this.meetingList = data;
      this.updateMeetingScrollList();
    });

    events.subscribe('hourscrollbutton:clicked', (time) => {
      this.updateButtonColor(time);
    });

    // called from the home in order to refresh the color and remove the orange color when cancelling a booking
    events.subscribe('refreshColor:clicked', () => {
      this.refreshColor();
    });


    this.adminService.isBookingEnabled$.subscribe((data) => {
      if (data === undefined) {
        return;
      }
      this.isBookingEnabled = data;
    })

    let that = this;
    this.adminService.bookingEndHour$.subscribe((data) => {
      if (data === undefined) {
        return;
      }

      that.upperRange = moment();
      that.upperRange.hours(data);
      that.upperRange.minutes(0);
      that.upperRange.seconds(0);
      that.upperRange.milliseconds(0);

      // if out of range, just retur
      if (moment.isMoment(that.upperRange) && moment.isMoment(that.date)) {
        if (that.date.isAfter(that.upperRange)) {
          that.updateStatus(ButtonStates.OUT_OF_RANGE, null);
          //console.log(that.upperRange);
          return;
        }
      }
    });
  }


  // refreshing while a selection in being done => do not remove the orange color
  updateMeetingScrollList() {
    if (this.buttonColor !== 'secondary') {
      this.refreshColor();
    }
  }

  // color logic
  // also called directly if a force refresh is needed
  refreshColor() {
    moment.locale("fr");
    if (!this.date) {
      return;
    }

    // if out of range, just return
    if (moment.isMoment(this.upperRange) && moment.isMoment(this.date)) {
      if (this.date.isAfter(this.upperRange)) {
        this.updateStatus(ButtonStates.OUT_OF_RANGE, null);
        //console.log(this.upperRange);
        return;
      }
    }

    // let newColor: string = 'primary';
    let newStatus: ButtonStates = ButtonStates.FREE;
    let newMeeting: Meeting = undefined;

    if (this.meetingList) {
      if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {

        this.meetingList.meetingList.forEach(function (m, index) {
          const start = m.startDateTime;
          const end = m.endDateTime;
          if (this.date.isBetween(start, end, null, '[)')
            || this.date.clone().add(this.hourScrollInterval - 1, "minutes").isBetween(start, end, null, '[)')) {
            // newColor = "danger";
            // this.attachedMeeting = m;
            newStatus = ButtonStates.OCCUPIED;
            newMeeting = m;
          }
        }.bind(this));
      }
    }

    if (this.buttonStatus === newStatus) {
      return;
    } else {
      this.updateStatus(newStatus, newMeeting);

    }
  }

  // called whenever a button is tapped
  updateButtonColor(time: moment.Moment) {
    if (!this.tappedTimeArray) {
      this.tappedTimeArray = new Array<moment.Moment>();
    }
    this.tappedTimeArray.push(time);

    if(this.buttonStatus === ButtonStates.OUT_OF_RANGE){
      return;
    }

    if (this.tappedTimeArray.length === 1) {
      if (this.meetingList) {
        if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {


          this.meetingList.meetingList.forEach(function (m, index) {
            const start = m.startDateTime;
            const end = m.endDateTime;

            if (this.date.isBetween(start, end, null, '[)')
              || this.date.clone().add(this.hourScrollInterval - 1, "minutes").isBetween(start, end, null, '[)')) {
              //this.buttonColor = "danger";
              this.updateStatus(ButtonStates.OCCUPIED, m);

              return;
            }
          }.bind(this));

          // if (this.buttonColor === "danger") {
          if (this.buttonStatus === ButtonStates.OCCUPIED) {
            return;
          }

          // case when multiple meetings
          // Disable buttons that are not in an acceptable range
          if (this.meetingList.meetingList.length > 0) {
            const tapped = this.tappedTimeArray[0];
            // if this is the tapped button => do nothing
            if (tapped !== this.date) {
              // find the closest before metting
              const beforeMeeting: moment.Moment = this.meetingList.meetingList.reduce(function (before: moment.Moment, meeting: Meeting) {
                if (meeting.endDateTime.isBetween(before, tapped) && meeting.endDateTime < tapped) {
                  return meeting.endDateTime;
                } else {
                  return before;
                }
              }, moment(new Date(1970, 1, 1)));
              // find the closest after meeting
              const afterMeeting: moment.Moment = this.meetingList.meetingList.reduce(function (after: moment.Moment, meeting: Meeting) {
                if (meeting.startDateTime.isBetween(tapped, after, null, "[]") && meeting.startDateTime > tapped) {
                  return meeting.startDateTime;
                } else {
                  return after;
                }
              }, moment(new Date(2099, 1, 1)));

              // if this button is not between the two meetings => should not be pressed
              if (!this.date.isBetween(beforeMeeting, afterMeeting, null, "[]")) {
                // this.buttonColor = ButtonStates.DISABLED;
                this.updateStatus(ButtonStates.DISABLED, undefined);
                // this.buttonColor = ButtonStates.DISABLED;
                return;
              }
            }
          }
        }
      }
    }

    if (this.tappedTimeArray.length >= 2) {
      // if the current button is between the 2 taps => [] is for inclusive comparison
      if (this.date.isBetween(this.tappedTimeArray[0], this.tappedTimeArray[1], null, '[]') || this.date.isBetween(this.tappedTimeArray[1], this.tappedTimeArray[0], null, '[]')) {
        this.buttonColor = 'primary-light';
        this.updateStatus(ButtonStates.TAPPED, undefined);
      }
      else {
        // if (this.buttonColor !== 'danger') {
        //   this.buttonColor = 'primary';
        // }
        if (this.buttonStatus !== ButtonStates.OCCUPIED) {
          this.updateStatus(ButtonStates.FREE, undefined);
        }
      }
      this.tappedTimeArray = new Array();
    }
    else {
      if (this.date !== time) {
        // if (this.buttonColor !== 'danger') {
        //   this.buttonColor = 'primary';
        // }
        if (this.buttonStatus !== ButtonStates.OCCUPIED) {
          this.updateStatus(ButtonStates.FREE, undefined);
        }
      }
    }
  }

  // color update logic
  // meeting stores the meeting related to this button, needed to display upcoming meeting
  // on tap on the red buttons
  updateStatus(newStatus: ButtonStates, attMeeting: Meeting) {

    this.attachedMeeting = attMeeting;
    if (this.buttonStatus === newStatus) {
      return;
    } else {
      this.buttonStatus = newStatus;
      switch (this.buttonStatus) {
        case ButtonStates.FREE:
          this.buttonColor = ButtonStates.FREE;
          break;
        case ButtonStates.DISABLED:
          this.buttonColor = ButtonStates.DISABLED;
          break;
        case ButtonStates.OCCUPIED:
          this.buttonColor = ButtonStates.OCCUPIED;
          break;
        case ButtonStates.TAPPED:
          this.buttonColor = ButtonStates.TAPPED;
          break;
        case ButtonStates.OUT_OF_RANGE:
          this.buttonColor = ButtonStates.OUT_OF_RANGE;
          break;
      }
    }
  }

  isDisabled() {
    // disable buttons before now
    // normally not necessary since the refresh loop rebuilds the array with fresh datetimes regularly
    if (this.date.clone().add(this.hourScrollInterval, "minutes") < moment()) {
      return true;
    }
    // if (this.buttonColor === ButtonStates.DISABLED) {
    //   return true;
    // }
    if (this.buttonStatus === ButtonStates.DISABLED) {
      return true;
    }
    if (this.buttonStatus === ButtonStates.OUT_OF_RANGE) {
      return true;
    }

    return false;
  }

  // sends event to the home page and the other buttons...
  onClick() {
    if (this.isBookingEnabled) {
      if (this.buttonColor !== 'danger') {
        this.updateStatus(ButtonStates.TAPPED, null);
        this.events.publish('hourscrollbutton:clicked', this.date);
      }
    }
    // if button is an occupied slot, launch details modal
    this.checkAttachedMeeting();
  }


  // Meeting details page & cancel logic
  checkAttachedMeeting() {
    if (this.attachedMeeting) {
      console.log(this.attachedMeeting);

      let obj = { meeting: this.attachedMeeting };
      let myModal = this.modalCtrl.create(
        ViewMeetingPage,
        obj,
        { cssClass: "my-modal" });


      myModal.onDidDismiss((ret: boolean) => {
          this.events.publish('forcerefresh', true);
      });

      myModal.present();
    }
  }
}
