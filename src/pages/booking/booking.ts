import { TranslateService } from '@ngx-translate/core';
import { Employee } from './../../app/shared/employee';
import { Meeting, MeetingType, MeetingStatus, MeetingConstructorInput } from './../../app/shared/meeting';
import { GesroomService } from './../../services/gesroom.service';
import { Room } from 'app/shared/room';
import { LoadingController, ViewController } from 'ionic-angular';
import { AdminService } from './../../services/admin.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as moment from "moment";
import { toTypeScript } from '@angular/compiler';
import { NfcCheckPage } from './../nfc-check/nfc-check';
import { NFC, Ndef } from '@ionic-native/nfc';
import { Subscription } from 'rxjs';



@IonicPage()
@Component({
  selector: 'page-booking',
  templateUrl: 'booking.html',
})
export class BookingPage {
  start: moment.Moment = this.navParams.get('start');
  end: moment.Moment = this.navParams.get('end');
  room: Room = this.navParams.get('room');

  emp: Employee = null;
  timer: number = 3000;


  msgSearchingAccouunt: string = "Recherche de votre compte...";
  msgAccountNotFound: string = "Impossible de trouver votre compte.";
  msgBookingError: string = "Une erreur est survenue : ";
  msgErrorTitle: string = "Erreur";
  msgBack: string = "Une erreur est survenue : ";
  msgPending: string = "Réservation de votre réunion en cours...";
  msgBookingDone: string = "Réservation de votre réunion en cours...";
  msgUnauthorized: string = "Vous n'êtes pas authorisé à réserver cette salle";

  isPinInClearText: boolean;

  isNfcEnabled: boolean;
  subscription: Subscription;


  constructor(public navCtrl: NavController, public navParams: NavParams, public adminService: AdminService, private alertCtrl: AlertController, private viewCtrl: ViewController, private loadingCtrl: LoadingController, private gesroomService: GesroomService, private translate: TranslateService, private nfc: NFC) {

  }

  ionViewDidLoad() {
  }

  ionViewWillEnter() {

    this.subscription = new Subscription();
    this.updateTranslations();

    this.adminService.isPinInClearText$.subscribe((data) => {
      if (!data) {
        return;
      }
      this.isPinInClearText = data;
    });

    this.adminService.isNfcEnabled$.subscribe((data) => {
      if (!data) {
        return;
      }
      this.isNfcEnabled = data;
      this.nfcTestMode();
    });
  }

  nfcTestMode() {
    if (this.isNfcEnabled) {
      // TODO : Remove subscription on exit
      this.subscription.add(this.nfc.addNdefListener(() => {
        console.log('successfully attached ndef listener');
      }, (err) => {
        console.log('error attaching ndef listener', err);
      }).subscribe((event) => {
        console.log('received ndef message. the tag contains: ', event.tag);
        console.log('decoded tag id', this.nfc.bytesToHexString(event.tag.id));

        let payload = event.tag.ndefMessage[0].payload;
        let tagContent = this.nfc.bytesToString(payload).substring(3);

        // let alert = this.alertCtrl.create({
        //   title: 'Test NFC ' + tagContent,
        //   subTitle: `Decoded tag id', ${tagContent}
        // <br>
        // ${this.hex2a(this.nfc.bytesToHexString(event.tag.id))}
        // `,
        //   buttons: ['Dismiss']
        // });
        // alert.present();
        
        this.onPinSubmit(tagContent);
      }));
    }
  }

  hex2a(hexx: string): string {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }
  
  async onPinSubmit(pinCodeSubmitted: string) {

    //console.log(pinCode);
    const loadingEmployee = this.loadingCtrl.create({
      spinner: 'dots',
      content: this.msgSearchingAccouunt,
      cssClass: 'prompt'
    });
    loadingEmployee.present();

    // const corporateId = this.adminService.corporateIdRadical + pinCodeSubmitted;
    const pinCode = pinCodeSubmitted;

    const site = this.adminService.selectedSite;
    this.emp = null;
    try {
      // get employee info based on the corporate ID
      this.emp = await this.gesroomService.getEmployeeDetails(pinCode, site);

      // if something went wrong...
      if (!this.emp) {
        const errorEmp = this.loadingCtrl.create({
          spinner: 'hide',
          content: this.msgAccountNotFound,
          cssClass: "prompt",
        });
        errorEmp.present();
        setTimeout(() => {
          errorEmp.dismiss();
          loadingEmployee.dismiss();
        }, this.timer);
      } else {
        // if OK, check if employee can book a meeting on this room
        const isEmployeeOk: Boolean = await this.gesroomService.checkRoomRights(this.room, this.emp);
        if (!isEmployeeOk) {
          const errorEmp = this.loadingCtrl.create({
            spinner: 'hide',
            content: this.msgUnauthorized,
            cssClass: "prompt",
          });

          errorEmp.present();
          setTimeout(() => {
            errorEmp.dismiss();
            loadingEmployee.dismiss();
            // and go back to the home page
            this.onCancelClicked();
          }, this.timer);
        }
      }
    } catch (error) {
      let alert = this.alertCtrl.create({
        title: this.msgErrorTitle,
        subTitle: this.msgBookingError + error,
        buttons: [this.msgBack],
        cssClass: "prompt"
      });
      alert.present();
    }

    loadingEmployee.dismiss();

    // await this.gesroomService.getEmployeeDetails(corporateId, site).then( (data, that = this) => {
    //   if(data){
    //       that.emp = data;
    //   }
    //   loadingEmployee.dismiss();
    // }, (reason) => {
    //   let alert = this.alertCtrl.create({
    //     title: this.msgErrorTitle,
    //     subTitle: this.msgBookingError+reason,
    //     buttons: [this.msgBack],
    //     cssClass: "prompt"
    //   });
    //   alert.present();
    // });

    if (!this.isEmployeeReady()) {
      const errorEmp = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.msgAccountNotFound,
        cssClass: "prompt",
      });
      errorEmp.present();
      setTimeout(() => {
        errorEmp.dismiss();
        loadingEmployee.dismiss();
      }, this.timer);
    }
  }

  async onPinCancel(pinCode: string) {
    this.onCancelClicked();
  }


  // called on the confirm booking page
  async confirmBooking() {
    // TODO : maybe check the user rights again?
    //if (this.adminService.isUserAuthorized(this.emp._corporateId)) {
    const loadingMeeting = this.loadingCtrl.create({
      spinner: 'dots',
      content: this.msgPending,
      cssClass: "prompt"
    });
    loadingMeeting.present();
    this.bookMeeting(this.start, this.end.subtract(1, "seconds"), this.emp, this.room).then((data) => {
      loadingMeeting.dismiss();
      const confirm = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.msgBookingDone,
        cssClass: "prompt"
      });
      confirm.present();
      setTimeout(() => {
        confirm.dismiss();
      }, this.timer);
    }, (reason) => {
      loadingMeeting.dismiss();
      let alert = this.alertCtrl.create({
        title: this.msgErrorTitle,
        subTitle: `${this.msgBookingError}: ${reason.status}<br>${reason.message}<br>${reason.error ? reason.error.message : ''}`,
        buttons: [this.msgBack],
        cssClass: 'alert'
      });
      alert.present();
      setTimeout(() => {
        alert.dismiss();
      }, this.timer);
    }
    );

    this.onCancelClicked();

    // }
    // else {
    //   let alert = this.alertCtrl.create({
    //     title: 'Non authorisé',
    //     subTitle: "Vous n'êtes pas authorisé à accèder à l'administration",
    //     buttons: ['retour']
    //   });
    //   alert.present();
    // }
  }



  async bookMeeting(start: moment.Moment, end: moment.Moment, employee: Employee, room: Room) {
    const title: string = "Réservation depuis tablette";
    const input: MeetingConstructorInput = {
      id: null,
      meetingDescription: title,
      startDateTime: start,
      endDateTime: end,
      owner: employee,
      room: room
    };
    let meeting: Meeting = new Meeting(input);



    // null,
    // null,
    // null,
    // title,
    // "",
    // MeetingType.Meeting /*meetintype*/,
    // MeetingStatus.NotStarted /* meeting status*/,
    // start,
    // end,
    // employee,
    // room,
    // '');

    await this.gesroomService.postMeeting(meeting);
  }

  isEmployeeReady(): boolean {
    if (!this.emp) {
      return false;
    }
    else if (!this.emp.id) {
      return false;
    }
    return true;
  }

  onCancelClicked() {
    // dismiss modal
    this.viewCtrl.dismiss();
  }

  ionViewWillLeave() {
    // otherwise alerts will increment
    this.subscription.unsubscribe();
  }


  async updateTranslations() {
    await this.translate.get('BOOKING.SEARCHING').toPromise().then((res) => {
      this.msgSearchingAccouunt = res;
    });
    await this.translate.get('BOOKING.ACCOUNT_NOT_FOUND').toPromise().then((res) => {
      this.msgAccountNotFound = res;
    });
    await this.translate.get('BOOKING.ERROR').toPromise().then((res) => {
      this.msgBookingError = res;
    });
    await this.translate.get('BOOKING.ERROR_TITLE').toPromise().then((res) => {
      this.msgErrorTitle = res;
    });
    await this.translate.get('BOOKING.BACK').toPromise().then((res) => {
      this.msgBack = res;
    });
    await this.translate.get('BOOKING.BOOKING_PENDING').toPromise().then((res) => {
      this.msgPending = res;
    });
    await this.translate.get('BOOKING.BOOKING_DONE').toPromise().then((res) => {
      this.msgBookingDone = res;
    });
    await this.translate.get('BOOKING.UNAUTHORIZED').toPromise().then((res) => {
      this.msgUnauthorized = res;
    });

  }
}
