import { HomePage } from './../../pages/home/home';
import { MeetingList } from './../../app/shared/meetingList';
import { AdminService } from './../../services/admin.service';
import { States, Meeting } from './../../app/shared/meeting';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as moment from "moment";


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

  constructor(private adminService: AdminService) {
    // this.buttonColor = this.getStateColor();

    this.adminService.meetingList$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      this.meetingList = data;
      this.updateMeetingScrollList();
    });
  }


  // getStateColor(): string {
  //   if (this.state) {
  //     if (this.state === States.OCCUPIED)
  //       return "danger";
  //   }
  //   return "primary";
  // }

  updateMeetingScrollList() {
    moment.locale("fr");

    if (this.meetingList) {
      if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {

        this.meetingList.meetingList.forEach(function (m, index) {
          const start = m.startDateTime;
          const end = m.endDateTime;
          if(this.date.isBetween(start, end) || this.date.clone().add(this.hourScrollInterval, "minutes").isBetween(start, end) ){
          // if (this.date <= start || this.date.clone().add(this.hourScrollInterval, "minutes") > start ) {
          // if (this.date <= start || this.date.clone().add(this.hourScrollInterval, "minutes") > start ) {
            this.buttonColor = "danger";
            console.log('button '+ this.date.toString() + ' inside '+ start.toString() + ' / '+ end.toString());

          }
        }.bind(this));
      }
    }
  }
}
