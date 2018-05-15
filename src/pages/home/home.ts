import { NfcCheckPage } from './../nfc-check/nfc-check';
import { MeetingList } from './../../app/shared/meetingList';
import { AdminService } from './../../services/admin.service';
import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import * as moment from "moment";
import { AdminPage } from "../admin/admin";
import { Room } from 'app/shared/room';

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {

  // dates in the hourscroll component
  dateArray: moment.Moment[] = [];

  // time displayed in the header
  headerTime: moment.Moment = moment();
  // hour scroll interval in minutes
  hourScrollInterval: number = 15;

  // screen refresh interval in milliseconds => used for the refresh method
  refreshInterval: number = 1000;

  // declaration in order to force label change in the header
  selectedRoom: Room;

  meetingList: MeetingList;

  // control of the refresh loop
  refreshLoop: any;

  constructor(
    public navCtrl: NavController,
    private adminService: AdminService,

  ) { }

  ionViewWillEnter() {
    moment.locale("fr");
    this.headerTime = moment();
    this.dateArray = new Array();
    // get the now moment
    const now = moment();
    // get the offset to the next quarter hour
    const remainer = this.hourScrollInterval - now.minute() % this.hourScrollInterval;

    // get the next quarter hour
    let rounded = now.add(remainer, "minutes").set("seconds", 0);

    this.dateArray.push(rounded.clone());

    for (let i = 1; i < 15; i++) {
      // warning, we use the same 'rounded' variable
      const iterate = rounded.add(this.hourScrollInterval, "minutes");
      this.dateArray.push(iterate.clone());
    }

    // get selected room
    this.selectedRoom = this.adminService.selectedRoom;

    // start the refresh loop
    this.refreshLoop=setInterval(() => this.refresh(), 1000);
  }


  updateHourScroll(){

  }


  // refreshes the data on screen based on time
  refresh() {
    this.headerTime = moment();
    //refresh the meetings
    this.meetingList = this.adminService.refreshMeetings();
  }


  // go to admin panel
  onAdminClicked() {

    // stop the refresh
    clearInterval(this.refreshLoop);

   // this.navCtrl.push(AdminPage);
    this.navCtrl.push(NfcCheckPage);
  }


}
