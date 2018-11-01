import { Employee } from './../../app/shared/employee';
import { GesroomService } from './../../services/gesroom.service';
import { AdminService } from './../../services/admin.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ViewController, AlertController } from 'ionic-angular';

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


  constructor(public navCtrl: NavController, public navParams: NavParams, public adminService: AdminService, private alertCtrl: AlertController, public viewCtrl: ViewController, private loadingCtrl: LoadingController, private gesroomService: GesroomService) {

  }

  async onPinSubmit(pinCode: string) {
    console.log(pinCode);
    const loadingEmployee = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Recherche de votre compte...',
      cssClass: "prompt"
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
      }

      loadingEmployee.dismiss();
    }, (reason) => {
      let alert = this.alertCtrl.create({
        title: 'Erreur',
        subTitle: "Une erreur est survenue : "+reason,
        buttons: ['retour'],
        cssClass: "alert"
      });
      alert.present();
    });
    if(!this.isEmployeeReady()){
      const errorEmp = this.loadingCtrl.create({
        spinner: 'hide',
        content: 'Impossible de trouver votre compte.',
        cssClass: "prompt"
      });
      errorEmp.present();
      setTimeout(() => {
        errorEmp.dismiss();
        loadingEmployee.dismiss();
      }, this.timer);
    }

    // return to the parent
    this.viewCtrl.dismiss(this.emp);
  }

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

}
