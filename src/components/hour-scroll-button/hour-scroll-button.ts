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
  TAPPED = 'primary-light'
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
  buttonColor: string = "primary";
  hourScrollInterval: number;
  private meetingList: MeetingList;
  private tappedTimeArray: moment.Moment[];

  constructor(private adminService: AdminService, public events: Events) {
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
    //this.buttonColor = "primary";
    if (!this.date)
      return;

    if (this.meetingList) {
      if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {

        this.meetingList.meetingList.forEach(function (m, index) {
          const start = m.startDateTime;
          const end = m.endDateTime;
          if (this.date.isBetween(start, end, null, '[)')
            || this.date.clone().add(this.hourScrollInterval - 1, "minutes").isBetween(start, end, null, '[)')) {
            this.buttonColor = "danger";
            return;
          }
        }.bind(this));
      }
    }
    if(this.buttonColor === "danger"){
      return;
    }
    this.buttonColor = "primary";

  }

  // called whenever a button is tapped
  updateButtonColor(time: moment.Moment) {
    if (!this.tappedTimeArray) {
      this.tappedTimeArray = new Array<moment.Moment>();
    }
    this.tappedTimeArray.push(time);

    if (this.tappedTimeArray.length === 1) {
      if (this.meetingList) {
        if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {


          this.meetingList.meetingList.forEach(function (m, index) {
            const start = m.startDateTime;
            const end = m.endDateTime;

            if (this.date.isBetween(start, end, null, '[)')
              || this.date.clone().add(this.hourScrollInterval - 1, "minutes").isBetween(start, end, null, '[)')) {
              this.buttonColor = "danger";
              return;
            }
          }.bind(this));

          if (this.buttonColor === "danger") {
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
              }, moment(new Date(1970,1,1)));
              // find the closest after meeting
              const afterMeeting: moment.Moment = this.meetingList.meetingList.reduce(function (after: moment.Moment, meeting: Meeting) {
                if (meeting.startDateTime.isBetween(tapped, after, null, "[]") && meeting.startDateTime > tapped) {
                  return meeting.startDateTime;
                } else {
                  return after;
                }
              }, moment(new Date(2099,1,1)));

              // if this button is not between the two meetings => should not be pressed
              if (!this.date.isBetween(beforeMeeting, afterMeeting, null, "[]")) {
                this.buttonColor = ButtonStates.DISABLED;
                return;
              }
            }
          }
        }
      }
    }

    if (this.tappedTimeArray.length >= 2) {
      // if the current button is between the 2 taps => [] is for inclusive comparison
      if (this.date.isBetween(this.tappedTimeArray[0], this.tappedTimeArray[1], null, '[]')) {
        this.buttonColor = 'primary-light';
      }
      else {
        if (this.buttonColor !== 'danger') {
          this.buttonColor = 'primary';
        }
      }
      this.tappedTimeArray = new Array();
    }
    else {
      if (this.date !== time) {
        if (this.buttonColor !== 'danger') {
          this.buttonColor = 'primary';
        }
      }
    }
  }


  isDisabled() {
    if ( this.date.clone().add(this.hourScrollInterval, "minutes") < moment() ) {
      return true;
    }
    if (this.buttonColor === ButtonStates.DISABLED) {
      return true;
    }
    return false;
  }
  // sends event to the home page and the other buttons...
  onClick() {
    if (this.buttonColor !== 'danger') {
      this.buttonColor = ButtonStates.TAPPED;
      this.events.publish('hourscrollbutton:clicked', this.date);
    }
  }
}
