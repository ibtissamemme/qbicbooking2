import { MeetingList } from './../../app/shared/meetingList';
import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Site } from "../../app/shared/site";
import { Room } from "../../app/shared/room";
import { GesroomService } from "../../services/gesroom.service";
import { AdminService } from "../../services/admin.service";


@IonicPage()
@Component({
  selector: "page-admin",
  templateUrl: "admin.html"
})
export class AdminPage {
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

  // flag to enable or not the booking on the tablet
  // default to true
  isBookingEnabled: boolean = true;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private gesroomService: GesroomService,
    private adminService: AdminService,
  ) {

  }

  ionViewWillEnter() {
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


    // get site list
    this.gesroomService.getSites().then(data => {
      if (!data) {
        return console.error('no site list data');
      }
      this.sites = data.json();
      // this.sites.map((res) => console.log(res.name + "/" + res.Id));

    }).then(() => {

      // get selected site
      this.adminService.selectedSite$.subscribe((data) => {
        if (!data) {
          return console.error('no room list data');
        }
        this.selectedSite = data;
      })
    }).then(() => {
      if (this.selectedSite) {
        // get room list
        this.gesroomService.getRooms(this.selectedSite).then(data => {
          if (!data) {
            return console.log('no selected room data');
          }

          this.rooms = data.json().sort();
        });
      }
    }
    );


    // get selected room
    this.adminService.selectedRoom$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      this.selectedRoom = data;
    });

    this.adminService.isBookingEnabled$.subscribe((data) => {
      if(!data) {
        return;
      }
      this.isBookingEnabled = data;
    })
  }

  onSiteChange() {
    console.log("new site: " + this.selectedSite.name);
    // set and store + returns the room list
    this.gesroomService.getRoomsIbs(this.selectedSite).subscribe((data) => {
      this.rooms = data.json().sort((a, b) => a.name.localeCompare(b.name));
    });
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

    // also save the api params
    this.onSaveAPIParam();
    // go back to the root page
    this.navCtrl.popToRoot();
  }
  onCancelClicked() {
    // go back to the root page
    this.navCtrl.popToRoot();
  }
  onBookingEnabledChange(){

  }


  compareSite(c1: Site, c2: Site): boolean {
    return c1 && c2 ? c1.Id === c2.Id : c1 === c2;
  }

  compareRoom(c1: Room, c2: Room): boolean {
    return c1 && c2 ? c1.Id === c2.Id : c1 === c2;
  }

}
