import { HomePage } from './../home/home';
import { RoomType, Room } from './../../app/shared/room';
import { GesroomService } from './../../services/gesroom.service';
import { AdminPage } from './../admin/admin';
import { MeetingList } from '../../app/shared/meetingList';
import { Meeting } from 'app/shared/meeting';
import { AdminService } from './../../services/admin.service';
import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, Events, ModalController, Slides } from "ionic-angular";
import * as moment from "moment";
import { Observable } from 'rxjs/Observable';
import { Employee } from '../../app/shared/employee';

@IonicPage()
@Component({
  selector: 'page-training',
  templateUrl: 'training.html',
})
export class TrainingPage {

  // time displayed in the header
  headerTime: moment.Moment = moment();
  headerColor: string = 'primary';

  // screen refresh interval in milliseconds => used for the refresh method
  refreshInterval: number = 50000;
  slideLoopInterval: number = 5000;
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
  // control of the refresh loop
  refreshLoop: any;
  slideLoop: any;
  slideURLarray: string[];
  // Slides for empty training page
  @ViewChild(Slides) slides: Slides;


  constructor(
    public navCtrl: NavController,
    private adminService: AdminService,
    private gesroomService: GesroomService,
    public events: Events,
    private modalCtrl: ModalController) {


  }

  ionViewWillEnter() {
    moment.locale("fr");
    this.headerTime = moment();

    // get selected room
    this.adminService.selectedRoom$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      console.log("admin obs room : " + data.name);
      this.selectedRoom = data;
      // if we switch to a standard room type, go to the home page
      if(this.selectedRoom.roomType === RoomType.Meeting){
        this.navCtrl.setRoot(HomePage);
      }
      this.refresh();
    });

    // get meeting updates
    this.adminService.meetingList$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      this.meetingList = data;
      this.getCurrentMeeting();
    });

    // get meeting updates
    this.adminService.slidesAvailable$.subscribe((data) => {
      if (!data) {
        return;
      }
      // only display slides if we have a meeting
      if (!this.meeting) {
        this.slideURLarray = data.slides;
        if(!this.slides){
          return;
        }
        this.slides.loop = true;
        this.slides.centeredSlides = true;
        this.slides.speed = 700;

        this.slideLoop = setInterval(() => this.nextSlide(), this.slideLoopInterval);
      }
    });

    // start the refresh loop
    // this.updateMeetingScrollList();
    this.refreshLoop = setInterval(() => this.refresh(), this.refreshInterval);
  }

  // refreshes the data on screen based on time
  refresh() {

    this.headerTime = moment();

  }


  // looks for the current meeting in the meeting list depending on the time
  // puts it in meeting
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
          // in training mode, we check 4 hours before
          if (this.headerTime.isBetween(start.clone().subtract(4, "hours"), start)) {
            this.upcomingMeeting = m;
          }

          if (this.headerTime.isBetween(start, end)) {
            this.currentMeeting = m;
            // console.log(this.currentMeeting.meetingName);

            // this.headerColor = 'danger';
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
      // this.headerColor = 'secondary';
    }
    else if (this.currentMeeting) {
      this.meeting = this.currentMeeting;

    }

    if (!this.upcomingMeeting && !this.currentMeeting) {
      // this.headerColor = 'primary';
      this.meeting = null;
    }

    console.log(this.meeting);
  }


  // go to admin panel
  onAdminClicked() {
    this.navCtrl.push(AdminPage);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    // stop the refresh
    clearInterval(this.refreshLoop);
    clearInterval(this.slideLoop);
  }

  ngOnDestroy() {
    // stop the refresh
    clearInterval(this.refreshLoop);
    clearInterval(this.slideLoop);
  }

  // go to the next slide
  nextSlide() {
    this.slides.slideNext();
  }



  isPresent(emp: Employee): boolean {
    if (emp.corporateID)
      return null;
    if (emp.status === -1)
      return false;
    if (emp.status === 1)
      return true;
    else return null;
  }
}
