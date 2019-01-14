import { TabletService } from './../../services/tablet.service';
import { StatusBar } from '@ionic-native/status-bar';
import { MeetingList } from './../../app/shared/meetingList';
import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, LoadingController, Platform, AlertController } from "ionic-angular";
import { Site, siteFromJson } from "../../app/shared/site";
import { Room, roomFromJSON } from "../../app/shared/room";
import { GesroomService } from "../../services/gesroom.service";
import { AdminService } from "../../services/admin.service";
import { NFC, Ndef } from '@ionic-native/nfc';
import { Subscription } from 'rxjs';
import { HomePage } from '../home/home';


@IonicPage()
@Component({
  selector: "page-admin",
  templateUrl: "admin.html"
})
export class AdminPage {
  subscription: Subscription;
  platform: Platform;
  sites: Site[] = [];
  rooms: Room[] = [];
  selectedSite: Site;
  selectedRoom: Room;

  endpoint: string = "http://safeware-custk.hds-group.com/GesroomRestAPI/Gesroom/API";
  userId: string;
  apiKey: string;
  tabletId: string;

  endpoint2: string;
  apiKey2: string;

  bookingStartHour;
  bookingEndHour;

  isPinInClearText: boolean = true;
  isNfcEnabled: boolean = true;

  // flag to enable or not the booking on the tablet
  // default to true
  isBookingEnabled: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private gesroomService: GesroomService,
    private adminService: AdminService,
    private tabletService: TabletService,
    private loadingCtrl: LoadingController,
    private _platform: Platform,
    private alertCtrl: AlertController,
    private nfc: NFC,
    private ndef: Ndef
  ) {
    this.platform = _platform;
  }

  async ionViewWillEnter() {
    this.subscription = new Subscription();

    this.gesroomService.endpoint$.subscribe((data) => {
      this.endpoint = data;
    });
    this.gesroomService.apiKey$.subscribe((data) => {
      this.apiKey = data;
    });
    this.gesroomService.endpoint2$.subscribe((data) => {
      this.endpoint2 = data;
    });
    this.gesroomService.apiKey2$.subscribe((data) => {
      this.apiKey2 = data;
    });
    this.gesroomService.userId$.subscribe((data) => {
      this.userId = data;
    });
    this.adminService.bookingStartHour$.subscribe((data) => {
      this.bookingStartHour = data;
    });
    this.adminService.bookingEndHour$.subscribe((data) => {
      this.bookingEndHour = data;
    });


    this.sites = await this.gesroomService.getSites();
    this.adminService.selectedSite$.subscribe((data) => {
      if (!data) {
        return console.error('no room list data');
      }
      this.selectedSite = data;
      this.updateRooms();
    });

    // get selected room
    this.adminService.selectedRoom$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      this.selectedRoom = data;
    });

    this.adminService.isBookingEnabled$.subscribe((data) => {
      if (!data) {
        return;
      }
      this.isBookingEnabled = data;
    });

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

  onSiteChange() {
    console.log("new site: " + this.selectedSite.name);
    // set and store + returns the room list
    this.updateRooms();
  }

  onRoomChange() {
    // nothing for now...
    console.log(this.selectedRoom.roomType);
  }

  onSaveAPIParam() {
    if (this.endpoint) {
      this.gesroomService.setEndpoint(this.endpoint);
    }
    if (this.apiKey) {
      this.gesroomService.setApiKey(this.apiKey);
    }
    if (this.endpoint2) {
      this.gesroomService.setEndpoint2(this.endpoint2);
    }
    if (this.apiKey2) {
      this.gesroomService.setApiKey2(this.apiKey2);
    }
    if (this.userId) {
      this.gesroomService.setUserId(this.userId);
    }
  }

  onConfirmClicked() {
    // set and store
    if (this.selectedSite) {
      this.adminService.setSelectedSite(this.selectedSite);
    }
    if (this.selectedRoom) {
      this.adminService.setSelectedRoom(this.selectedRoom);
    }
    this.adminService.setIsBookingEnabled(this.isBookingEnabled);
    this.adminService.setisPinInClearText(this.isPinInClearText);
    this.adminService.setisNfcEnabled(this.isNfcEnabled);

    this.bookingStartHour = Number.parseInt(this.bookingStartHour);
    this.bookingEndHour = Number.parseInt(this.bookingEndHour);

    // TODO: translate this....
    if (!Number.isInteger(this.bookingStartHour) || !Number.isInteger(this.bookingEndHour)) {
      const sorryAlert = this.loadingCtrl.create({
        spinner: 'hide',
        content: "Please enter a number between 0 and 23 for the start time and the end time",
        cssClass: 'prompt'
      });
      sorryAlert.present();
      setTimeout(() => {
        sorryAlert.dismiss();
      }, 3000);
      return;
    }


    if (!this.checkHourRange(this.bookingStartHour) || !this.checkHourRange(this.bookingEndHour)) {
      const sorryAlert = this.loadingCtrl.create({
        spinner: 'hide',
        content: "Merci de rentrer un chiffre entre 0 et 23 pour l'heure de début et de fin de plage horaire",
        cssClass: 'prompt'
      });
      sorryAlert.present();
      setTimeout(() => {
        sorryAlert.dismiss();
      }, 3000);
      return;
    }
    this.adminService.setBookingStartHour(this.bookingStartHour);
    this.adminService.setBookingEndHour(this.bookingEndHour);

    // also save the api params
    this.onSaveAPIParam()
    // go back to the root page
    // this.navCtrl.setRoot(HomePage);
    // setTimeout(() => this.navCtrl.popToRoot(), 500);
    this.navCtrl.pop();
  }

  // reboot the device
  onRebootClick() {
    this.tabletService.rebootTablet();
  }
  onCloseAppClick() {
    this.platform.exitApp();
  }

  // updates rooms on site change
  async updateRooms() {
    if (this.selectedSite) {
      // get room list
      this.rooms = await this.gesroomService.getRooms(this.selectedSite);
      this.rooms = this.rooms.sort((a, b) => a.name.localeCompare(b.name));
    }
  }


  onCancelClicked() {
    // go back to the root page
    this.navCtrl.popToRoot();
  }
  onBookingEnabledChange() {

  }

  onBookingPinVisibilityChange() {

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

        let alert = this.alertCtrl.create({
          title: 'Test NFC ' + event.tag,
          subTitle: `Decoded tag id', ${this.nfc.bytesToHexString(event.tag.id)}
        <br>
        ${this.hex2a(this.nfc.bytesToHexString(event.tag.id))}
        `,
          buttons: ['Dismiss']
        });
        alert.present();

      }));
    }
  }

  compareSite(c1: Site, c2: Site): boolean {
    return c1 && c2 ? c1.Id === c2.Id : c1 === c2;
  }

  compareRoom(c1: Room, c2: Room): boolean {
    return c1 && c2 ? c1.Id === c2.Id : c1 === c2;
  }

  checkHourRange(input: number): boolean {
    if (input < 0 || input > 23) {
      return false;
    }
    return true;
  }


  hex2a(hexx: string): string {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }


  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
