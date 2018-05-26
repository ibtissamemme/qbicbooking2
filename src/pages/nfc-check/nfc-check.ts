import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { NFC, Ndef } from '@ionic-native/nfc';

/**
 * Generated class for the NfcCheckPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nfc-check',
  templateUrl: 'nfc-check.html',
})
export class NfcCheckPage {
  nfcTag: string;
  message: string;

  platformList: string = '';
  isApp: boolean = true;

  code: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private nfc: NFC, private ndef: Ndef, private platform: Platform) {
    let platforms = this.platform.platforms();

    this.platformList = platforms.join(', ');

    if (this.platform.is('core') || this.platform.is('mobileweb')) {
      this.isApp = false;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NfcCheckPage');

    if (this.isApp) {
      this.nfc.addNdefListener(() => {
        console.log('successfully attached ndef listener');
        this.message = 'Veuillez scanner un badge';
      }, (err) => {
        console.log('error attaching ndef listener', err);
        this.message = 'Impossible de lancer le NFC';
      }).subscribe((event) => {
        console.log('received ndef message. the tag contains: ', event.tag);
        console.log('decoded tag id', this.nfc.bytesToHexString(event.tag.id));
        this.nfcTag = this.nfc.bytesToHexString(event.tag.id);
      });
    }
    else this.message = 'Impossible de lancer le NFC';

  }

  onPinSubmit(pinCode:string){
    console.log(pinCode);

  }

}
