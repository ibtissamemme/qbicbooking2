import { TranslateService } from '@ngx-translate/core';
import { Employee } from './../../app/shared/employee';
import { Meeting, MeetingType, MeetingStatus } from './../../app/shared/meeting';
import { GesroomService } from './../../services/gesroom.service';
import { Room } from 'app/shared/room';
import { LoadingController, ViewController } from 'ionic-angular';
import { AdminService } from './../../services/admin.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as moment from "moment";


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
  timer:number = 3000;


  msgSearchingAccouunt: string = "Recherche de votre compte...";
  msgAccountNotFound: string = "Impossible de trouver votre compte.";
  msgBookingError: string = "Une erreur est survenue : ";
  msgErrorTitle: string = "Erreur";
  msgBack: string = "Une erreur est survenue : ";
  msgPending: string = "Réservation de votre réunion en cours...";
  msgBookingDone: string = "Réservation de votre réunion en cours...";


  constructor(public navCtrl: NavController, public navParams: NavParams, public adminService: AdminService, private alertCtrl: AlertController, public viewCtrl: ViewController, private loadingCtrl: LoadingController, private gesroomService: GesroomService, private translate: TranslateService) {
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter(){
    this.updateTranslations();
  }

  async onPinSubmit(pinCode: string) {


    console.log(pinCode);
    const loadingEmployee = this.loadingCtrl.create({
      spinner: 'dots',
      content: this.msgSearchingAccouunt,
      cssClass: 'prompt'
    });
    loadingEmployee.present();

    const corporateId = 'SESA' + pinCode;
    const site=this.adminService.selectedSite;
    //await this.gesroomService.getEmployeeById(pinCode).then( (data) => {
    await this.gesroomService.getEmployeeDetails(corporateId, site).then( (data, that = this) => {
      if(data){
        // for some reason we get back an array
          const _emp = JSON.parse(data.text())[0];
          that.emp = new Employee();
          Object.assign(that.emp, _emp);
          //that.emp = Object.setPrototypeOf(_emp, Employee);
      }

      loadingEmployee.dismiss();
    }, (reason) => {
      let alert = this.alertCtrl.create({
        title: this.msgErrorTitle,
        subTitle: this.msgBookingError+reason,
        buttons: [this.msgBack],
        cssClass: "prompt"
      });
      alert.present();
    });
    if(!this.isEmployeeReady()){
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
      this.bookMeeting(this.start, this.end.subtract(1,"seconds"), this.emp, this.room).then( (data )=> {
        loadingMeeting.dismiss();
        const confirm = this.loadingCtrl.create({
          spinner: 'hide',
          content: this.msgBookingDone,
          cssClass: "prompt"
        });
        confirm.present();
        setTimeout(() => {
          confirm.dismiss();
          this.onCancelClicked();
        }, this.timer);
      },(reason) => {
        loadingMeeting.dismiss();
        let alert = this.alertCtrl.create({
          title: this.msgErrorTitle,
          subTitle: this.msgBookingError+reason,
          buttons: [this.msgBack],
          cssClass: 'alert'
        });
        alert.present();
        setTimeout(() => {
          alert.dismiss();
          this.onCancelClicked();
        }, this.timer);
      }
    )

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
    const title:string = "Réservation depuis tablette";

    let meeting: Meeting = new Meeting(
      null,
      null,
      null,
      title,
      "",
      MeetingType.Meeting /*meetintype*/,
      MeetingStatus.NotStarted /* meeting status*/,
      start,
      end,
      employee,
      room,
      '');

    await this.gesroomService.postMeeting(meeting);
  }

  isEmployeeReady():boolean{
    if(!this.emp){
      return false;
    }
    else if(!this.emp._corporateId){
      return false;
    }
    return true;
  }

  onCancelClicked(){
    // dismiss modal

    this.viewCtrl.dismiss();
  }


  async updateTranslations(){
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

  }
}
