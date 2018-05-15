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
  selectedSite: any;
  selectedRoom: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private gesroomService: GesroomService,
    private adminService: AdminService
  ) { }

  ionViewDidLoad() {
    console.log("ionViewDidLoad AdminPage");
  }


  ionViewWillEnter() {

    this.gesroomService.getSites().then(data => {
      this.sites = data.json();
    });
    this.selectedSite = this.adminService.selectedSite;
  }

  onSiteChange() {
    // set and store + returns the room list
    this.rooms = this.adminService.setSelectedSite(this.selectedSite);
  }

  onRoomChange() {
    // set and store
    this.adminService.setSelectedRoom(this.selectedRoom);
  }

}
