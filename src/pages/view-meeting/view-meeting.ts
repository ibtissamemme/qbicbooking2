import { HomePage } from './../home/home';

import { GesroomService } from './../../services/gesroom.service';
import { AdminService } from './../../services/admin.service';

import { CheckPincodePage } from './../check-pincode/check-pincode';
import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, ModalController, LoadingController } from 'ionic-angular';

import { Employee } from './../../app/shared/employee';
import { Meeting } from './../../app/shared/meeting';
/**
 * Generated class for the ViewMeetingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-view-meeting',
  templateUrl: 'view-meeting.html',
})
export class ViewMeetingPage {

  meeting: Meeting=this.navParams.get('meeting');
  promptTimer:number = 3000;
  displayPincodeAttr: boolean = false;

  msgSearchingAccouunt: string = "Recherche de votre compte...";
  msgAccountNotFound: string = "Impossible de trouver votre compte.";
  msgBookingError: string = "Une erreur est survenue : ";
  msgErrorTitle: string = "Erreur";

  msgError: string = "Une erreur est survenue : ";
  msgPending: string = "Réservation de votre réunion en cours...";
  msgBack: string = "Retour";
  msgConfirmCancelTitle: string = "Annulation";
  msgConfirmCancelText: string = "Êtes-vous sûr de vouloir annuler cette réservation ?";
  msgConfirmCancelTextConfirm: string = "Confirmer";

  msgOwnerOnly: string = "Seul l'organisateur peut annuler cette réunion"

  msgCancellationPending: string = "Annulation en cours...";
  msgCancellationDone: string = "Annulation effectuée."

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController, private translate: TranslateService, private alertCtrl: AlertController, private adminService: AdminService, private gesroomService: GesroomService, private loadingCtrl: LoadingController
    ) {
  }

  ionViewDidLoad() {

    this.updateTranslations();

    if(!this.meeting){
      this.viewCtrl.dismiss();
    }
      if(this.meeting.owner) {
        let emp = new Employee();
        this.meeting.owner = Object.assign(emp, this.meeting.owner);
    }
  }

  // first cancel button
  // displays the confirm alert
  onCancelBookingClick(){
    let self = this;

    let alert = this.alertCtrl.create({
      title: this.msgConfirmCancelTitle,
      subTitle: this.msgConfirmCancelText,
      buttons: [{
        // back button
        text: this.msgBack,
        role: 'cancel',
        handler: () => {
          this.viewCtrl.dismiss();
        }
      },
      {
        // confirm button
        text: this.msgConfirmCancelTextConfirm,
        handler: () => {
          self.displayPincodeAttr = true;
        }
      }],
      cssClass: "prompt"
    });
    alert.present();
  }

  // not really used...
  onBackClicked(){
    this.viewCtrl.dismiss();
  }


  cancelBookingHandler(){
    this.displayPincodeAttr = true;
  }
  displayPincode(): boolean{
    return this.displayPincodeAttr;
  }


  async onPinSubmit(pinCode: string) {
    let emp:Employee;

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
          emp = new Employee();
          Object.assign(emp, _emp);
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

    if(!emp){
      const errorEmp = this.loadingCtrl.create({
        spinner: 'hide',
        content: this.msgAccountNotFound,
        cssClass: "prompt"
      });
      errorEmp.present();
      setTimeout(() => {
        errorEmp.dismiss();
        loadingEmployee.dismiss();
      }, this.promptTimer);
    } else {
      // check that the found employee is the owner
      // check is done on the corporate id
      if(emp._corporateId !== this.meeting.owner._corporateId){
        const errorEmp = this.loadingCtrl.create({
          spinner: 'hide',
          content: this.msgOwnerOnly,
          cssClass: "alert"
        });
        errorEmp.present();
        setTimeout(() => {
          errorEmp.dismiss();
          loadingEmployee.dismiss();
        }, this.promptTimer);
        // hide the moddal
        this.viewCtrl.dismiss();
      } else {
        this.cancelBooking(emp);
      }
    }

  }

  // launch the cancel on the API
  cancelBooking(emp:Employee){
    const loadingMeeting = this.loadingCtrl.create({
      spinner: 'dots',
      content: this.msgCancellationPending,
      cssClass: 'prompt'
    });
    loadingMeeting.present();


    this.gesroomService.deleteMeeting(this.meeting).then(
      () => {
        loadingMeeting.dismiss();
        const confirm = this.loadingCtrl.create({
          spinner: 'hide',
          content: this.msgCancellationDone,
          cssClass: 'prompt'
        });
        confirm.present();
        setTimeout(() => {
          confirm.dismiss();

        }, this.promptTimer);
      }, (reason) => {
        loadingMeeting.dismiss();
        let alert = this.alertCtrl.create({
          title: this.msgErrorTitle,
          subTitle:this.msgBookingError + reason,
          buttons: ['retour']
        });
        alert.present();
        setTimeout(() => {
          alert.dismiss();
        }, this.promptTimer);
      });

      // hide the modal, send something to the hone.ts to trigger a refresh
      this.viewCtrl.dismiss(true);
  }

  async updateTranslations(){
    await this.translate.get('BOOKING.SEARCHING').toPromise().then((res) => {
      this.msgSearchingAccouunt = res;
    });
    await this.translate.get('BOOKING.ACCOUNT_NOT_FOUND').toPromise().then((res) => {
      this.msgAccountNotFound = res;
    });
    await this.translate.get('BOOKING.OWNER_ONLY').toPromise().then((res) => {
      this.msgOwnerOnly = res;
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
    await this.translate.get('BOOKING.CANCEL_TITLE').toPromise().then((res) => {
      this.msgConfirmCancelTitle = res;
    });
    await this.translate.get('BOOKING.CANCEL_CONFIRM_BUTTON').toPromise().then((res) => {
      this.msgConfirmCancelTextConfirm = res;
    });

    await this.translate.get('BOOKING.CANCEL_CONFIRM').toPromise().then((res) => {
      this.msgConfirmCancelText = res;
    });

    await this.translate.get('BOOKING.CANCEL_PENDING').toPromise().then((res) => {
      this.msgCancellationPending = res;
    });
    await this.translate.get('BOOKING.CANCEL_DONE').toPromise().then((res) => {
      this.msgCancellationDone = res;
    });

  }
}
