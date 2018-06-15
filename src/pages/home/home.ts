import { States } from './../../app/shared/meeting';
import { NfcCheckPage } from './../nfc-check/nfc-check';
import { MeetingList } from '../../app/shared/meetingList';
import { Meeting } from 'app/shared/meeting';
import { AdminService } from './../../services/admin.service';
import { Component } from "@angular/core";
import { NavController, Events } from "ionic-angular";
import * as moment from "moment";
import { Room } from 'app/shared/room';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {

  // dates in the hourscroll component
  dateArray: moment.Moment[] = [];

  // time displayed in the header
  headerTime: moment.Moment = moment();
  headerColor: string = 'primary';
  // hour scroll interval in minutes
  hourScrollInterval: number;

  // screen refresh interval in milliseconds => used for the refresh method
  refreshInterval: number = 50000;

  // declaration in order to force label change in the header
  selectedRoom: Room;

  //test with observable
  selectedRoom$: Observable<Room>;

  meetingList: MeetingList;

  // current meeting => red status
  currentMeeting: Meeting;
  // upcoming meeting => orange status
  upcomingMeeting: Meeting;
  // merged meeting for displaying purposes
  meeting: Meeting;

  tappedButtons: moment.Moment[] = [];

  // control of the refresh loop
  refreshLoop: any;

  constructor(
    public navCtrl: NavController,
    private adminService: AdminService,
    public events: Events) {
    this.hourScrollInterval = adminService.hourScrollInterval;

    events.subscribe('hourscrollbutton:clicked', (time) => {
      this.buttonPressed(time);
    });

  }

  ionViewWillEnter() {
    moment.locale("fr");
    this.headerTime = moment();
    this.dateArray = new Array();

    // get the now moment
    const now = moment();
    // get the offset to the next quarter hour
    const remainer = this.hourScrollInterval - now.minute() % this.hourScrollInterval;

    // get the next quarter hour
    let rounded = now.add(remainer, "minutes").set("seconds", 0);

    this.dateArray.push(rounded.clone());

    for (let i = 1; i < 15; i++) {
      // warning, we use the same 'rounded' variable
      const iterate = rounded.add(this.hourScrollInterval, "minutes");
      this.dateArray.push(iterate.clone());
    }

    // get selected room
    this.adminService.selectedRoom$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      console.log("admin obs room : " + data.name);
      this.selectedRoom = data;
      this.refresh();
    });
    // start the refresh loop
    // this.updateMeetingScrollList();
    this.refreshLoop = setInterval(() => this.refresh(), this.refreshInterval);
  }



  // refreshes the data on screen based on time
  refresh() {
    console.log('refresh');

    this.headerTime = moment();
    //refresh the meetings
    this.adminService.refreshMeetings().then((meetings) => {
      this.meetingList = meetings;
      // this.updateMeetingScrollList();
      this.getCurrentMeeting();
    });
  }

  getCurrentMeeting() {
    moment.locale("fr");


    this.upcomingMeeting = null;
    this.currentMeeting = null;
    this.meeting = null;

    if (this.meetingList) {
      if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {
        this.meetingList.meetingList.forEach(function (m, index) {
          const start = m.startDateTime;
          const end = m.endDateTime;


          // check upcoming meeting
          if (this.headerTime.isBetween(start.clone().subtract(this.hourScrollInterval, "minutes"), start)) {

            this.upcomingMeeting = m;

          }

          if (this.headerTime.isBetween(start, end)) {

            this.currentMeeting = m;
            console.log(this.currentMeeting.meetingName);

            this.headerColor = 'danger';

          }

        }.bind(this));
      }
    }

    // if we are still here, it means that we have an upcoming meeting an nothing else
    if (this.upcomingMeeting) {
      if (this.currentMeeting) {
        // if we have an upcomming meeting at the end of the current meeting, we stick to the current meeting
        if (this.currentMeeting.startDateTime <= this.upcomingMeeting.startDateTime) {
          this.upcomingMeeting = null;
          this.meeting = this.currentMeeting;
        }
        else {
          this.meeting = this.upcomingMeeting;
        }
      }
      else {
        this.meeting = this.upcomingMeeting;
      }
      this.headerColor = 'secondary';
    }
    else if (this.currentMeeting) {
      this.meeting = this.currentMeeting;

    }

    if (!this.upcomingMeeting && !this.currentMeeting) {
      this.headerColor = 'primary';
      this.meeting = null;
    }
  }

  buttonPressed(time: moment.Moment) {

    if (!this.tappedButtons) {
      this.tappedButtons = new Array();
    }
    this.tappedButtons.push(time);
    console.log(this.tappedButtons.length + " : " + time.format('LT'));

    if (this.tappedButtons.length >= 2) {
      this.tappedButtons = new Array();
    }
  }

  // go to admin panel
  onAdminClicked() {
    // this.navCtrl.push(AdminPage);
    this.navCtrl.push(NfcCheckPage);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    // stop the refresh
    clearInterval(this.refreshLoop);
  }

  ngOnDestroy() {
    // stop the refresh
    clearInterval(this.refreshLoop);
  }
}
