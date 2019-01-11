import { TranslateService } from '@ngx-translate/core';
import { Employee } from './../../app/shared/employee';
import { GesroomService } from './../../services/gesroom.service';
import { AdminService } from './../../services/admin.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ViewController, AlertController } from 'ionic-angular';
import { AdminPage } from './../admin/admin';
import { NFC } from '@ionic-native/nfc';
import { Subscription } from 'rxjs';

/**
 * Generated class for the CheckPincodePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-check-pincode',
  templateUrl: 'check-pincode.html',
})
export class CheckPincodePage {
  emp:Employee;

  timer:number = 3000;
  isPinInClearText:boolean;

  msgSearching: string = "Recherche de votre compte...";
  msgNotFound: string = "Impossible de trouver votre compte.";
  msgError: string = "Une erreur est survenue : ";
  msgErrorTitle: string = "Erreur";
  msgBack: string = "Retour";
  msgUnauthorized: string = "Vous n'êtes pas authorisé à réserver cette salle";
  isNfcEnabled: boolean;
  subscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public adminService: AdminService, private alertCtrl: AlertController, public viewCtrl: ViewController, private loadingCtrl: LoadingController, private gesroomService: GesroomService, private translate: TranslateService, private nfc: NFC) {

  }

  ionViewWillEnter(){
    this.subscription = new Subscription;
    this.adminService.isPinInClearText$.subscribe((data) => {
      if(!data) {
        return;
      }
      this.isPinInClearText = data;
    });

    this.updateTranslations();
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

        this.onPinSubmit(tagContent);
      }));
    }
  }

  async onPinSubmit(pinCode: string) {
    console.log(pinCode);
    if (this.adminService.isAdminAuthorized(pinCode)) {
      this.navCtrl.push(AdminPage);
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Non authorisé',
        subTitle: "Vous n'êtes pas authorisé à accèder à l'administration",
        buttons: ['retour']
      });
      alert.present();
      setTimeout(() => {
        alert.dismiss();
      }, this.timer);
    }

    this.onPinCancel();

  }

  // async onPinSubmit(pinCode: string) {
  //   //console.log(pinCode);
  //   const loadingEmployee = this.loadingCtrl.create({
  //     spinner: 'dots',
  //     content: this.msgSearching,
  //     cssClass: "prompt"
  //   });
  //   loadingEmployee.present();

  //   const corporateId = this.adminService.corporateIdRadical + pinCode;
  //   const site=this.adminService.selectedSite;

  //   try {
  //     // get employee info based on the corporate ID
  //     this.emp = await this.gesroomService.getEmployeeDetails(corporateId, site);
  //     //loadingEmployee.dismiss();

  //     // if something went wrong...
  //     if(!this.emp){
  //       const errorEmp = this.loadingCtrl.create({
  //         spinner: 'hide',
  //         content: this.msgNotFound,
  //         cssClass: "prompt",
  //       });
  //       errorEmp.present();
  //       setTimeout(() => {
  //         errorEmp.dismiss();
  //       }, this.timer);
  //       return;
  //     } else {
  //       // if OK, check if employee can book a meeting on this room
  //       const isEmployeeOk: Boolean = await this.gesroomService.checkRoomRights(this.adminService.selectedRoom, this.emp);
  //       if(!isEmployeeOk){
  //         const errorEmp = this.loadingCtrl.create({
  //           spinner: 'hide',
  //           content: this.msgUnauthorized,
  //           cssClass: "prompt",
  //         });
  //         errorEmp.present();
  //         setTimeout(() => {
  //           errorEmp.dismiss();
  //           //loadingEmployee.dismiss();
  //         }, this.timer);
  //       }
  //     }
  //   } catch (error) {
  //     let alert = this.alertCtrl.create({
  //       title: this.msgErrorTitle,
  //       subTitle: this.msgError+error,
  //       buttons: [this.msgBack],
  //       cssClass: "prompt"
  //     });
  //     alert.present();
  //   } finally {
  //     loadingEmployee.dismiss();
  //      // return to the parent
  //   this.viewCtrl.dismiss(this.emp);
  //   }
  //   // this.emp = await this.gesroomService.getEmployeeDetails(corporateId, site).then( (data, that = this) => {
  //   //   if(data){
  //   //     // for some reason we get back an array
  //   //       const _emp = JSON.parse(data.text())[0];
  //   //       that.emp = new Employee(_emp);
  //   //       Object.assign(that.emp, _emp);
  //   //   }

  //   //   loadingEmployee.dismiss();
  //   // }, (reason) => {
  //   //   let alert = this.alertCtrl.create({
  //   //     title: this.msgErrorTitle,
  //   //     subTitle: this.msgError+reason,
  //   //     buttons: [this.msgBack],
  //   //     cssClass: "alert"
  //   //   });
  //   //   alert.present();
  //   // });
  //   // if(!this.isEmployeeReady()){
  //   //   const errorEmp = this.loadingCtrl.create({
  //   //     spinner: 'hide',
  //   //     content: this.msgNotFound,
  //   //     cssClass: "prompt"
  //   //   });
  //   //   errorEmp.present();
  //   //   setTimeout(() => {
  //   //     errorEmp.dismiss();
  //   //     loadingEmployee.dismiss();
  //   //   }, this.timer);
  //   // }


  // }

  async onPinCancel() {
    this.viewCtrl.dismiss();
  }


  isEmployeeReady(): boolean {
    if (!this.emp) {
      return false;
    }
    else if (!this.emp._corporateId) {
      return false;
    }
    return true;
  }

  ionViewWillLeave() {
    // Otherwise alerts will increment
    this.subscription.unsubscribe();
  }

  async updateTranslations(){

    await this.translate.get('BOOKING.SEARCHING').toPromise().then((res) => {
      this.msgSearching = res;
    });

    await this.translate.get('BOOKING.ACCOUNT_NOT_FOUND').toPromise().then((res) => {
      this.msgNotFound = res;
    });
    await this.translate.get('BOOKING.ERROR').toPromise().then((res) => {
      this.msgError = res;
    });
    await this.translate.get('BOOKING.ERROR_TITLE').toPromise().then((res) => {
      this.msgErrorTitle = res;
    });
    await this.translate.get('BOOKING.BACK').toPromise().then((res) => {
      this.msgBack = res;
    });
    await this.translate.get('BOOKING.UNAUTHORIZED').toPromise().then((res) => {
      this.msgUnauthorized = res;
    });
  }
}
