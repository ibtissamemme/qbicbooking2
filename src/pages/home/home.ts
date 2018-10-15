import { TabletService } from './../../services/tablet.service';
import { GesroomService } from './../../services/gesroom.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomType } from './../../app/shared/room';
import { BookingPage } from './../booking/booking';
import { MeetingType, MeetingStatus } from './../../app/shared/meeting';
import { NfcCheckPage } from './../nfc-check/nfc-check';
import { MeetingList } from '../../app/shared/meetingList';
import { States, Meeting } from '../../app/shared/meeting';
import { AdminService } from './../../services/admin.service';
import { Component } from "@angular/core";
import { NavController, Events, ModalController, LoadingController } from "ionic-angular";
import * as moment from "moment";
import { Room } from 'app/shared/room';
import { Observable } from 'rxjs/Observable';
import { TrainingPage } from '../training/training';

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
  subHeaderTheme: string;
  past:any;
  nextMeetingCountDownResult: number;
  helperLabel: string = 'Touchez un créneau pour débutter votre réservation &darr;';
  // hour scroll interval in minutes
  hourScrollInterval: number;

  // screen refresh interval in milliseconds => used for the refresh method
  refreshInterval: number = 30000;

  // declaration in order to force label change in the header
  selectedRoom: Room;

  //test with observable
  selectedRoom$: Observable<Room>;

  meetingList: MeetingList;
  PageStates = States;
  currentStatus: States = States.FREE;

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
    private gesroomService: GesroomService,
    public events: Events,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private loadingCtrl: LoadingController,
    private tabletService: TabletService) {
    this.hourScrollInterval = adminService.hourScrollInterval;


  }

  ionViewWillEnter() {

    this.events.subscribe('hourscrollbutton:clicked', (time) => {
      this.buttonPressed(time);
    });

    moment.locale("fr");

    this.buildHourScrollArray();

    // get selected room
    this.adminService.selectedRoom$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      console.log("admin obs room : " + data.name);
      this.selectedRoom = data;
      if (this.selectedRoom.roomType === RoomType.Training) {
        this.goToTrainingPage();
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


    // start the refresh loop
    // this.updateMeetingScrollList();
    this.refreshLoop = setInterval(() => this.refresh(), this.refreshInterval);

  }



  // refreshes the data on screen based on time
  refresh() {
    this.getHelperText();
    this.headerTime = moment();
    this.buildHourScrollArray();

    this.nextMeetingCountDownResult = this.nextMeetingCountDown();
    //refresh the meetings
    this.adminService.refreshMeetings();
    this.tabletService.changeLED(this.currentStatus);
  };


  buildHourScrollArray(){
    this.headerTime = moment();
    this.dateArray = new Array();

    // get the now moment
    const now = moment();

    // // get the offset to the next quarter hour
    // const remainer = this.hourScrollInterval - now.minute() % this.hourScrollInterval;
    // // get the next quarter hour
    // let rounded = now.add(remainer, "minutes").set("seconds", 0);

    // get the offset to the previous quarter hour
    const remainer = now.minute() % this.hourScrollInterval;
    // get the next quarter hour
    let rounded = now.subtract(remainer, "minutes").set("seconds", 0).set("milliseconds",0);

    this.dateArray.push(rounded.clone());

    for (let i = 1; i < 15; i++) {
      // warning, we use the same 'rounded' variable
      const iterate = rounded.add(this.hourScrollInterval, "minutes");
      this.dateArray.push(iterate.clone());
    }

  }


  // looks for the current meeting in the meeting list depending on the time
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
            this.changeStatus(States.OCCUPIED)
            //this.headerColor = 'danger';
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
      this.changeStatus(States.PENDING)
      //this.headerColor = 'secondary';
    }
    else if (this.currentMeeting) {
      this.meeting = this.currentMeeting;

    }

    if (!this.upcomingMeeting && !this.currentMeeting) {
      this.changeStatus(States.FREE)
      // this.headerColor = 'primary';
      this.meeting = null;
    }

    // if the next meeting is a training, we switch to training
    if (this.meeting && this.meeting.meetingType === MeetingType.Training) {
      this.goToTrainingPage();
    }
  }

  getHelperText() {
    if (this.tappedButtons.length === 1) {
      this.translate.get('HOME_PAGE.TOUCH_TO_CONTINUE').subscribe((res: string) => {
        this.helperLabel = res;
    });
  }
  else {
            this.translate.get('HOME_PAGE.TOUCH_TO_BEGIN').subscribe((res: string) => {
              this.helperLabel = res;
          });
    }
  }

  buttonPressed(time: moment.Moment) {

    if (!this.tappedButtons) {
      this.tappedButtons = new Array();
    }
    this.tappedButtons.push(time);
    this.getHelperText();

    if (this.tappedButtons.length >= 2) {
      // clone dates to avoid changeing displayed values inside the buttons...
      let start: moment.Moment = this.tappedButtons[0].clone();
      let end: moment.Moment = this.tappedButtons[1].clone();
      if (this.tappedButtons[0] > this.tappedButtons[1]) {
        start = this.tappedButtons[1].clone();
        end = this.tappedButtons[0].clone();
      }
      end = end.add(this.hourScrollInterval, 'minutes');
      let obj = { start: start, end: end, room: this.selectedRoom };
      let myModal = this.modalCtrl.create(BookingPage, obj);
      this.tappedButtons = new Array();

      myModal.onDidDismiss(() => {
        this.refresh();
        // force refresh of the button colors => remove the orange if cancelled
        this.events.publish('refreshColor:clicked');
      });

      myModal.present();

      // when the modal goes up, we empty the array for the tapped buttons
      this.tappedButtons = [];
    }
  }

  goToTrainingPage() {
    this.navCtrl.setRoot(TrainingPage);
  }


  // go to admin panel
  onAdminClicked() {
    // this.navCtrl.push(AdminPage);
    this.navCtrl.push(NfcCheckPage);
  }

  changeStatus(state: States) {
    this.currentStatus = state;
    switch (state) {
      case States.PENDING:
        this.headerColor = 'secondary';
        this.subHeaderTheme = 'upcoming'
        break;
      case States.OCCUPIED:
        this.headerColor = 'danger';
        this.subHeaderTheme = 'occupied'
        break;

      default:
        this.headerColor = 'primary';
        this.subHeaderTheme = 'free'
        break;
    }

  }

  // used to display the progress bar until the end of the meeting
  getProgress(): string{
    if(this.meeting && this.currentStatus === States.OCCUPIED){
      const now = moment().unix();
      const start = this.meeting.startDateTime.unix();
      const end = this.meeting.endDateTime.unix();
      const progress = Math.floor((now - start) * 100 / (end - start));

      return progress + '%';
    }
    return '0%';
  }

  async startNow(){
    this.meeting.startDateTime = moment();
    this.meeting.meetingStatus = MeetingStatus.Started;
    let updatePending: string = "Modification de votre réservation en cours...";
    let updateDone: string = "Modification de votre réservation effectuée.";

    await this.translate.get('UPDATE.PENDING').toPromise().then( (res) => {
      updatePending = res;
    })
    await this.translate.get('UPDATE.DONE').toPromise().then( (res) => {
      updateDone = res;
    })

    const loadingMeeting = this.loadingCtrl.create({
      spinner: 'dots',
      content:  updatePending
    });
    loadingMeeting.present();
    this.gesroomService.putMeeting(this.meeting)
    .then( (res) => {
      console.log(res);
      loadingMeeting.dismiss();
        const confirm = this.loadingCtrl.create({
          spinner: 'hide',
          content: updateDone,
        });
        confirm.present();
        setTimeout(() => {
          confirm.dismiss();
          this.refresh();
        }, 3000);
    })
    ;
  }

  async endNow(){
    this.meeting.endDateTime = moment();
    let pendingMessage: string = "Modification de votre réservation en cours...";
    let doneMessage: string = "Modification de votre réservation effectuée.";

    await this.translate.get('CANCEL.PENDING').toPromise().then( (res) => {
      pendingMessage = res;
    })
    await this.translate.get('CANCEL.DONE').toPromise().then( (res) => {
      doneMessage = res;
    })

    const loadingMeeting = this.loadingCtrl.create({
      spinner: 'dots',
      content:  pendingMessage
    });
    loadingMeeting.present();
    this.gesroomService.putMeeting(this.meeting)
    .then( (res) => {
      console.log(res);
      loadingMeeting.dismiss();
        const confirm = this.loadingCtrl.create({
          spinner: 'hide',
          content: doneMessage,
        });
        confirm.present();
        setTimeout(() => {
          confirm.dismiss();
          this.refresh();
        }, 3000);
    })
    ;
  }

  // used to display the number of minutes until the next meeting
  nextMeetingCountDown(): number{
    if(this.meeting  && this.currentStatus === States.PENDING){
      const now = moment();
      const start = this.meeting.startDateTime;
      const shift = moment.duration(start.diff(now));
      return Math.ceil(shift.asMinutes());
    } else {
      return 0;
    }
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    // stop the refresh
    clearInterval(this.refreshLoop);
    this.events.unsubscribe('hourscrollbutton:clicked');
  }

  ngOnDestroy() {
    // stop the refresh
    clearInterval(this.refreshLoop);
  }

}
