import { Employee } from './../../app/shared/employee';
import { CheckPincodePage } from './../check-pincode/check-pincode';
import { StatusBar } from '@ionic-native/status-bar';
import { TabletService } from './../../services/tablet.service';
import { GesroomService } from './../../services/gesroom.service';
import { TranslateService } from '@ngx-translate/core';
import { RoomType } from './../../app/shared/room';
import { BookingPage } from './../booking/booking';
import { MeetingType, MeetingStatus, States, Meeting } from './../../app/shared/meeting';
import { NfcCheckPage } from './../nfc-check/nfc-check';
import { MeetingList } from '../../app/shared/meetingList';
import { AdminService } from './../../services/admin.service';
import { Component, ViewChild, ElementRef, trigger, state, style, transition, animate } from "@angular/core";
import { NavController, Events, ModalController, LoadingController, Content, AlertController } from "ionic-angular";
import * as moment from "moment";
import { Room } from 'app/shared/room';
import { Observable } from 'rxjs/Observable';
import { TrainingPage } from '../training/training';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ENV } from '@app/env';

@Component({
  selector: "page-home",
  templateUrl: "home.html",
  animations: [
    trigger('opacityChange', [
      state('shown', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('shown <=> hidden', animate('200ms ease'))
    ]),
    trigger('displayChange', [
      state('block', style({ display: 'block' })),
      state('none', style({ display: 'none' })),
      transition('none => block', animate('0ms ease')),
      transition('block => none', animate('0ms 200ms ease'))
    ])
  ]
})
export class HomePage {

  // dates in the hourscroll component
  dateArray: moment.Moment[] = [];

  // time displayed in the header
  headerTime: moment.Moment = moment();
  headerColor: string = 'primary';
  subHeaderTheme: string;
  past: any;
  nextMeetingCountDownResult: number;
  helperLabel: string = 'Touchez un créneau pour débutter votre réservation &darr;';

  imageSRC: SafeResourceUrl;
  defaultImage: string = "../assets/imgs/room_Photo.png";

  logo: string = `assets/imgs/${ENV.logo}`;

  // overlay control
  isOverlayDisplayed: boolean = true;
  isSomethingElseDisplayed: boolean = false;

  // handle over the timer for the overlay
  overlayTimer: any;
  overlayOpacityState = 'shown';
  overlayDisplayState = 'block';
  overlayIdleTime = 60000;

  @ViewChild('buttonBar') buttonBar: ElementRef;

  language = 'fr';

  // hour scroll interval in minutes
  hourScrollInterval: number;

  // flag to disabled booking from the tablet
  isBookingEnabled: boolean = true;
  // screen refresh interval in milliseconds => used for the refresh method
  refreshInterval: number = 30000;
  buttonNumber: number = 20;
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
    private alertController: AlertController,
    private translate: TranslateService,
    private loadingCtrl: LoadingController,
    private tabletService: TabletService,
    private _sanitizer: DomSanitizer,
    private statusBar: StatusBar) {
    this.hourScrollInterval = adminService.hourScrollInterval;

    this.statusBar.hide();
    this.statusBar.overlaysWebView(true);

    // get selected room
    this.adminService.selectedRoom$.subscribe((data) => {
      if (!data) {
        return;
      }
      console.log("admin obs room : " + data.name);
      this.selectedRoom = data;

      // Room capacity
      // TODO debug
      this.gesroomService.getRoomCapacity(this.selectedRoom)
        .then((data) => {
          this.selectedRoom.capacity = data;
        });
      // Photo
      this.gesroomService.getRoomPicture(this.selectedRoom).then((data) => {
        if (!data) {
          return;
        }
        const resp = JSON.parse(data.text());
        const photo = JSON.stringify(resp.Photo).replace(/\\n/g, '');
        this.imageSRC = this._sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpg;base64,${photo}`);
        //console.log(this.imageSRC);

      });

      if (this.selectedRoom.roomType === RoomType.Training) {
        this.goToTrainingPage();
      }
      this.refresh();
    });

    // get meeting updates
    this.adminService.meetingList$.subscribe((data) => {
      if (!data) {
        return;
      }
      this.meetingList = data;
      this.getCurrentMeeting();
    });

    this.adminService.isBookingEnabled$.subscribe( (data) => {
      if (data === undefined) {
        return;
      }
      this.isBookingEnabled = data;
      //console.log("home",this.isBookingEnabled);
    });

  }

  // init of the view
  ionViewWillEnter() {

    this.events.subscribe('hourscrollbutton:clicked', (time) => {
      this.buttonPressed(time);
    });

    //moment.locale(this.language);
    moment.locale('fr');

    // set the language button to the next language
    this.language = this.getNextLang(this.language);
    this.buildHourScrollArray();


    // start the refresh loop
    // this.updateMeetingScrollList();
    this.refreshLoop = setInterval(() => this.refresh(), this.refreshInterval);

  }

  scrollLeft() {
    this.buttonBar.nativeElement.scrollLeft -= 200;
  }
  scrollRight() {
    this.buttonBar.nativeElement.scrollLeft += 200;
  }

  // returns the default image if there is no room picture
  getBackgroundImage(): string | SafeResourceUrl {
    // if (!this.imageSRC) {
    //   return this._sanitizer.bypassSecurityTrustStyle(`url(${this.defaultImage})`);
    // } else {
    //   return this._sanitizer.bypassSecurityTrustStyle(`url(${this.imageSRC})`);
    // }
    //return this.imageSRC;
    return this.defaultImage;
  }

  tapHandler() {
    clearInterval(this.overlayTimer);
    this.removeOverlay();
  }
  removeOverlay() {
    //this.isOverlayDisplayed = false;
    this.overlayOpacityState = 'hidden';
    this.overlayDisplayState = 'none'
    this.overlayTimer = setTimeout(() => {
      this.displayOverlay();
    }, this.overlayIdleTime);
  }
  displayOverlay() {
    if (this.currentStatus == States.FREE && !this.isSomethingElseDisplayed) {
      //this.isOverlayDisplayed = true;
      this.overlayOpacityState = 'shown';
      this.overlayDisplayState = 'block';
    }
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


  buildHourScrollArray() {
    this.headerTime = moment();
    this.dateArray = new Array();

    // get the now moment
    const now = moment();

    // get the offset to the next quarter hour
    const remainer = this.hourScrollInterval - now.minute() % this.hourScrollInterval;
    // get the next quarter hour
    let rounded = now.add(remainer, "minutes").set("seconds", 0);

    // // get the offset to the previous quarter hour
    // const remainer = now.minute() % this.hourScrollInterval;
    // // get the next quarter hour
    // let rounded = now.subtract(remainer, "minutes").set("seconds", 0).set("milliseconds",0);

    this.dateArray.push(rounded.clone());

    for (let i = 1; i < this.buttonNumber; i++) {
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

    // found flag
    let f: boolean = false;

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
            this.meeting = m;
            //console.log(this.currentMeeting.meetingName);
            this.changeStatus(States.OCCUPIED)
            f = true;
            //this.headerColor = 'danger';
          }
          if (f) {
            return;
          }
        }.bind(this));
      }
    }

    if (f) {
      return;
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

  // cycles through the available langages
  getNextLang(currentLanguage: string): string {
    const langs = this.translate.getLangs();
    return (langs.indexOf(currentLanguage) < langs.length - 1) ? langs[langs.indexOf(currentLanguage) + 1] : langs[0];
  }
  // changes to the next language
  changeLangage() {
    this.translate.use(this.language);
    this.language = this.getNextLang(this.language);
    this.getHelperText();
    // langage displayed on the interface should be the next lang
  }


  buttonPressed(time: moment.Moment) {
    if (!this.tappedButtons) {
      this.tappedButtons = new Array<moment.Moment>();
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

      // loads the book meeting modal
      this.bookMeeting(start, end);

      this.isSomethingElseDisplayed = true;
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
    if (this.currentStatus !== state) {
      console.log("Changed status to ", state);
    }
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
    this.tabletService.changeLED(this.currentStatus);

  }

  // used to display the progress bar until the end of the meeting
  getProgress(): string {
    if (this.meeting && this.currentStatus === States.OCCUPIED) {
      const now = moment().unix();
      const start = this.meeting.startDateTime.unix();
      const end = this.meeting.endDateTime.unix();
      // +1 is there to make sure something is dispolayed
      const progress = Math.floor((now - start) * 100 / (end - start)) + 1;

      return progress + '%';
    }
    return '0%';
  }


  bookMeeting(start: moment.Moment, end: moment.Moment) {

    let obj = { start: start, end: end, room: this.selectedRoom };
    let myModal = this.modalCtrl.create(BookingPage, obj);
    this.tappedButtons = new Array();

    myModal.onDidDismiss(() => {
      this.isSomethingElseDisplayed = false;
      this.refresh();
      // force refresh of the button colors => remove the orange if cancelled
      this.events.publish('refreshColor:clicked');
    });

    myModal.present();
  }

  // Presents the modal for pincode check
  // launches the start now confirm if pincode OK
  async startNow() {
    this.isSomethingElseDisplayed = true;

    let myModal = this.modalCtrl.create(CheckPincodePage);
    this.tappedButtons = new Array();

    myModal.onDidDismiss(async (emp: Employee) => this.confirmStartMeeting(emp));
    myModal.present();
  }

  // Start now meeting loginc
  // called after the pincode check
  async confirmStartMeeting(emp: Employee) {
    console.log(emp);

    // TODO : proper identity check;
    if (!emp || !emp._corporateId) {
      return;
    }
    this.meeting.startDateTime = moment();
    this.meeting.meetingStatus = MeetingStatus.Started;
    let updatePending: string = "Modification de votre réservation en cours...";
    let updateDone: string = "Modification de votre réservation effectuée.";

    await this.translate.get('UPDATE.PENDING').toPromise().then((res) => {
      updatePending = res;
    })
    await this.translate.get('UPDATE.DONE').toPromise().then((res) => {
      updateDone = res;
    })

    const loadingMeeting = this.loadingCtrl.create({
      spinner: 'dots',
      content: updatePending
    });
    loadingMeeting.present();

    this.gesroomService.putMeeting(this.meeting)
      .then((res) => {
        //console.log(res);
        loadingMeeting.dismiss();
        const confirm = this.loadingCtrl.create({
          spinner: 'hide',
          content: updateDone,
        });
        confirm.present();
        setTimeout(() => {
          confirm.dismiss();
          this.refresh();
          this.isOverlayDisplayed = false;
        }, 3000);
      });
    this.isSomethingElseDisplayed = false;
    this.refresh();
    // force refresh of the button colors => remove the orange if cancelled
    this.events.publish('refreshColor:clicked');
  }

  async endNow() {
    this.isSomethingElseDisplayed = true;

    let myModal = this.modalCtrl.create(CheckPincodePage);
    this.tappedButtons = new Array();

    myModal.onDidDismiss(async (emp: Employee) => this.confirmEndNow(emp));
    myModal.present();
  }

  async confirmEndNow(emp: Employee) {

    // TODO : proper identity check;
    if (!emp || !emp._corporateId) {
      return;
    }

    this.meeting.endDateTime = moment();
    let pendingMessage: string = "Modification de votre réservation en cours...";
    let doneMessage: string = "Modification de votre réservation effectuée.";

    await this.translate.get('CANCEL.PENDING').toPromise().then((res) => {
      pendingMessage = res;
    })
    await this.translate.get('CANCEL.DONE').toPromise().then((res) => {
      doneMessage = res;
    })

    const loadingMeeting = this.loadingCtrl.create({
      spinner: 'dots',
      content: pendingMessage
    });
    loadingMeeting.present();
    this.gesroomService.putMeeting(this.meeting)
      .then((res) => {
        //console.log(res);
        loadingMeeting.dismiss();
        const confirm = this.loadingCtrl.create({
          spinner: 'hide',
          content: doneMessage,
        });
        confirm.present();
        setTimeout(() => {
          confirm.dismiss();
          this.refresh();
          this.isSomethingElseDisplayed = false;
        }, 3000);
      }, (reason) => {
        loadingMeeting.dismiss();
        let alert = this.alertController.create({
          title: 'Erreur',
          subTitle: "Une erreur est survenue : "+reason,
          buttons: ['retour']
        });
        alert.present();
        setTimeout(() => {
          alert.dismiss();
        }, 3000);
      }).catch((err) => {

      });
  }

  // used to display the number of minutes until the next meeting
  nextMeetingCountDown(): number {
    if (this.meeting && this.currentStatus === States.PENDING) {
      const now = moment();
      const start = this.meeting.startDateTime;
      const shift = moment.duration(start.diff(now));
      return Math.ceil(shift.asMinutes());
    } else {
      return 0;
    }
  }

  ionViewWillLeave() {
    //console.log('ionViewWillLeave');
    // stop the refresh
    clearInterval(this.refreshLoop);
    this.events.unsubscribe('hourscrollbutton:clicked');
  }

  ngOnDestroy() {
    // stop the refresh
    clearInterval(this.refreshLoop);
  }

}
