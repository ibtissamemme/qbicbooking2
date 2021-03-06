import {TabletService} from './../../services/tablet.service';
import {StatusBar} from '@ionic-native/status-bar';
import {MeetingList} from './../../app/shared/meetingList';
import {Component} from "@angular/core";
import {IonicPage, NavController, NavParams, LoadingController, Platform, AlertController} from "ionic-angular";
import {Site, siteFromJson} from "../../app/shared/site";
import {Room, roomFromJSON} from "../../app/shared/room";
import {GesroomService} from "../../services/gesroom.service";
import {AdminService} from "../../services/admin.service";


@IonicPage()
@Component({
  selector: "page-admin",
  templateUrl: "admin.html"
})
export class AdminPage {
  platform: Platform;
  sites: Site[] = [];
  rooms: Room[] = [];
  selectedSite: Site;
  selectedRoom: Room;

  endpoint: string;
  userId: string;
  apiKey: string;
  tabletId: string;

  endpoint2: string;
  apiKey2: string;
  prefix: string;

  bookingStartHour;
  bookingEndHour;

  isPinInClearText: boolean = true;

  // flag to enable or not the booking on the tablet
  // default to true
  isBookingEnabled: boolean = true;
  // popin dismiss timeout
  timer: number = 3000;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private gesroomService: GesroomService,
    private adminService: AdminService,
    private tabletService: TabletService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private _platform: Platform
  ) {
    this.platform = _platform;
  }

  async ionViewWillEnter() {
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
    this.adminService.prefix$.subscribe((data) => {
      this.prefix = data;
    });
    this.adminService.selectedSite$.subscribe((data) => {
      if (!data) {
        return console.error('no room list data');
      }
      this.selectedSite = data;
      this.updateRooms();
    });


    // // get site list
    // this.gesroomService.getSites().then(data => {
    //   if (!data) {
    //     return console.error('no site list data');
    //   }
    //   this.sites = new Array<Site>();
    //   const input = data.json().sort();

    //   input.forEach(element => {
    //     this.sites.push(siteFromJson(element));
    //   });
    //   // this.sites = data.json();
    //   // this.sites.map((res) => console.log(res.name + "/" + res.Id));

    // }).then(() => {

    //   // get selected site
    //   this.adminService.selectedSite$.subscribe((data) => {
    //     if (!data) {
    //       return console.error('no room list data');
    //     }
    //     this.selectedSite = data;
    //   })
    // }).then(() => {
    //   if (this.selectedSite) {
    //     // get room list
    //     this.gesroomService.getRooms(this.selectedSite).then(data => {
    //       if (!data) {
    //         return console.log('no selected room data');
    //       }
    //       this.rooms = data;
    //       // this.rooms = new Array<Room>();
    //       // const input = data.json().sort();
    //       // input.forEach(element => {
    //       //   this.rooms.push(roomFromJSON(element));
    //       // });
    //     });
    //   }
    // }
    // );


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
  }

  onSiteChange() {
    console.log("new site: " + this.selectedSite.name);
    // set and store + returns the room list
    this.updateRooms();
  }

  onRoomChange() {
    // nothing for now...
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

    // prefix can be empty string => no null value check there...
    this.adminService.setPrefix(this.prefix);

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

    this.bookingStartHour = Number.parseInt(this.bookingStartHour);
    this.bookingEndHour = Number.parseInt(this.bookingEndHour);

    // TODO: translate this....
    if (!Number.isInteger(this.bookingStartHour) || !Number.isInteger(this.bookingEndHour)) {
      const sorryAlert = this.loadingCtrl.create({
        spinner: 'hide',
        content: "Merci de rentrer un chiffre pour l'heure de début et de fin de plage horaire",
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
    this.onSaveAPIParam();
    // go back to the root page
    setTimeout(() => this.navCtrl.popToRoot(), 500);
  }

  onTestClick() {
    const loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'loading...',
      cssClass: 'prompt'
    });
    loading.present();
    this.onSaveAPIParam();
    this.gesroomService.authenticate().then(() => {
      loading.dismiss();
      // on successful test immidiatly refresh sites
      this.updateSites();
      let alert = this.alertCtrl.create({
        title: 'Connection OK.',
        subTitle: `Paramètres API OK.`,
        buttons: ['OK'],
        cssClass: 'alert'
      });
      alert.present();
      setTimeout(() => {
        alert.dismiss();
      }, this.timer);
    }).catch((reason) => {
      loading.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Connection problem...',
        subTitle: `Error ${reason.status}<br>${reason.message}<br>${reason.error ? reason.error.message : ''}`,
        buttons: ['OK'],
        cssClass: 'alert'
      });
      alert.present();
      setTimeout(() => {
        alert.dismiss();
      }, this.timer);
    })
  }

  onResetClick() {
    let alert = this.alertCtrl.create({
      title: 'Warning',
      message: `<p>Attention, cette action entrainera une réinitialisation des paramètres et un fermeture de l'application.</p>
                <p>Vous devrez la redémarrer.</p>
                <p>Souhaitez-vous continuer ?</p>`,
      buttons: [{
        role: 'cancel',
        text: 'Annuler',
        handler: (data) => {
          alert.dismiss();
          return false;
        }
      },
        {
          text: 'Réinitialisation',
          handler: (data) => {
            alert.dismiss();
            this.adminService.localStorageReset().then(() => {
              this.platform.exitApp();
            });
            return false;
          }
        }],
      cssClass: 'alert'
    });
    alert.present();
    setTimeout(() => {
      alert.dismiss();
    }, this.timer);
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

  async updateSites() {
    this.gesroomService.getSites().then((sites) => {
      this.sites = sites;
    });
  }

  onCancelClicked() {
    // go back to the root page
    this.navCtrl.popToRoot();
  }

  onBookingEnabledChange() {

  }

  onBookingPinVisibilityChange() {

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
}
