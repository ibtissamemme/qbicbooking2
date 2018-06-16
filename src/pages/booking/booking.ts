import { ModalController } from 'ionic-angular';
import { AdminService } from './../../services/admin.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as moment from "moment";

/**
 * Generated class for the BookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-booking',
  templateUrl: 'booking.html',
})
export class BookingPage {
  start:moment.Moment = this.navParams.get('start');
  end: moment.Moment = this.navParams.get('end');
  constructor(public navCtrl: NavController, public navParams: NavParams, public adminService:AdminService, private alertCtrl:AlertController, private modalCtrl:ModalController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BookingPage');
  }

  confirmBooking(){

  }

  onPinSubmit(pinCode: string) {
    console.log(pinCode);
    if (this.adminService.isUserAuthorized(pinCode)) {
    //TODO confirm
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Non authorisé',
        subTitle: "Vous n'êtes pas authorisé à accèder à l'administration",
        buttons: ['retour']
      });
      alert.present();
    }

  }

}
