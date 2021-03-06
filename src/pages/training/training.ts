import { HomePage } from './../home/home';
import { RoomType, Room } from './../../app/shared/room';
import { GesroomService } from './../../services/gesroom.service';
import { AdminPage } from './../admin/admin';
import { MeetingList } from '../../app/shared/meetingList';
import { Meeting, States } from '../../app/shared/meeting';
import { AdminService } from './../../services/admin.service';
import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, Events, ModalController, Slides } from "ionic-angular";
import * as moment from "moment";
import { Observable } from 'rxjs/Observable';
import { Employee } from '../../app/shared/employee';
import { ENV } from '@app/env';
import { TabletService } from './../../services/tablet.service';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-training',
  templateUrl: 'training.html',
})
export class TrainingPage {

  // time displayed in the header
  headerTime: moment.Moment = moment();
  headerColor: string = 'primary';

  logo: string = `assets/imgs/${ENV.logo}`;

  // screen refresh interval in milliseconds => used for the refresh method
  refreshInterval: number = 30000;
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
  language: string;
  // Slides for empty training page
  @ViewChild(Slides) slides: Slides;


  constructor(
    public navCtrl: NavController,
    private adminService: AdminService,
    private gesroomService: GesroomService,
    public events: Events,
    public tabletService: TabletService,
    private modalCtrl: ModalController,
    private translate: TranslateService,) {

      this.language = this.adminService.defaultLang;

  }


  ionViewWillEnter() {
    moment.locale("fr");
    this.headerTime = moment();
    // changing led to green
    this.tabletService.changeLED(States.FREE);

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
    // this.adminService.slidesAvailable$.subscribe((data) => {
    //   if (!data) {
    //     return;
    //   }
    //   // only display slides if we have a meeting
    //   if (!this.meeting) {
    //     this.slideURLarray = data.slides;
    //     if(!this.slides){
    //       return;
    //     }
    //     this.slides.loop = true;
    //     this.slides.centeredSlides = true;
    //     this.slides.speed = 700;

    //     this.slideLoop = setInterval(() => this.nextSlide(), this.slideLoopInterval);
    //   }
    // });

      // only display slides if we have a meeting
      if (!this.meeting) {
        this.slideURLarray = new Array<string>();
        this.slideURLarray.push("assets/slideshow/2.jpg");
        this.slideURLarray.push("assets/slideshow/3.jpg");
        this.slideURLarray.push("assets/slideshow/4.jpg");
        this.slideURLarray.push("assets/slideshow/5.jpg");

        this.slides.loop = true;
        this.slides.centeredSlides = true;
        this.slides.speed = 700;

        this.slideLoop = setInterval(() => this.nextSlide(), this.slideLoopInterval);
      }


    this.refreshLoop = setInterval(() => this.refresh(), this.refreshInterval);
  }

  // refreshes the data on screen based on time
  refresh() {
    this.adminService.refreshMeetings();
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
        } else {
          this.meeting = this.upcomingMeeting;
        }
      } else {
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
    this.tabletService.changeLED(States.FREE);

  }


  // go to admin panel
  onAdminClicked() {
    this.navCtrl.push(AdminPage);
    clearInterval(this.refreshLoop);
    clearInterval(this.slideLoop);
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
    if(this.slides) {
      this.slides.slideNext();
    }
  }


// cycles through the available langages
getNextLang(currentLanguage: string): string {
  const langs = this.translate.getLangs();
  return (langs.indexOf(currentLanguage) < langs.length - 1) ? langs[langs.indexOf(currentLanguage) + 1] : langs[0];
}
 // changes to the next language
 changeLangage() {
  this.translate.use(this.language);
  this.language = this.getNextLang(this.language);
  //this.getHelperText();
  // langage displayed on the interface should be the next lang
}


}
