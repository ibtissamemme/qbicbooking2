import { HomePage } from './../../pages/home/home';
import { MeetingList } from './../../app/shared/meetingList';
import { AdminService } from './../../services/admin.service';
import { States, Meeting } from './../../app/shared/meeting';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as moment from "moment";
import { Events } from 'ionic-angular';


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
  private meetingList: MeetingList;
  private tappedTimeArray: moment.Moment[];

  constructor(private adminService: AdminService, public events: Events) {
    // this.buttonColor = this.getStateColor();

    this.adminService.meetingList$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
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
  refreshColor(){
    moment.locale("fr");
    this.buttonColor = "primary";
    if(!this.date)
      return;

    if (this.meetingList) {
      if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {

        this.meetingList.meetingList.forEach(function (m, index) {
          const start = m.startDateTime;
          const end = m.endDateTime;
          if (this.date.isBetween(start, end) || this.date.clone().add(this.hourScrollInterval, "minutes").isBetween(start, end)) {
            this.buttonColor = "danger";
            return;
          }
        }.bind(this));
      }
    }
  }

  updateButtonColor(time: moment.Moment) {
    if (!this.tappedTimeArray) {
      this.tappedTimeArray = new Array();
    }
    this.tappedTimeArray.push(time);

    if (this.tappedTimeArray.length >= 2) {
      // if the current button is between the 2 taps => [] is for inclusive comparison
      if (this.date.isBetween(this.tappedTimeArray[0], this.tappedTimeArray[1], null, '[]')) {
        this.buttonColor = 'secondary';
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

  onClick() {
    if (this.buttonColor !== 'danger') {
      this.buttonColor = 'secondary';
      this.events.publish('hourscrollbutton:clicked', this.date);
    }
  }
}
