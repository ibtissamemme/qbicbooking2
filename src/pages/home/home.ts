import { States } from './../../app/shared/meeting';
import { NfcCheckPage } from './../nfc-check/nfc-check';
import { MeetingList } from '../../app/shared/meetingList';
import { Meeting } from 'app/shared/meeting';
import { AdminService } from './../../services/admin.service';
import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import * as moment from "moment";
import { Room } from 'app/shared/room';
import { Observable } from 'rxjs/Observable';


@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {

  // dates in the hourscroll component
  dateArray: moment.Moment[] = [];

  // options for the buttons
  optionArray: Map<moment.Moment, Object> = new Map<moment.Moment, Object>();

  // time displayed in the header
  headerTime: moment.Moment = moment();
  // hour scroll interval in minutes
  hourScrollInterval: number;

  // screen refresh interval in milliseconds => used for the refresh method
  refreshInterval: number = 5000;

  // declaration in order to force label change in the header
  selectedRoom: Room;

  //test with observable
  selectedRoom$: Observable<Room>;

  meetingList: MeetingList;

  // control of the refresh loop
  refreshLoop: any;

  constructor(
    public navCtrl: NavController,
    private adminService: AdminService,

  ) {
    this.hourScrollInterval = adminService.hourScrollInterval;
  }

  ionViewWillEnter() {
    moment.locale("fr");
    this.headerTime = moment();
    this.dateArray = new Array();
    this.optionArray = new Map();

    // get the now moment
    const now = moment();
    // get the offset to the next quarter hour
    const remainer = this.hourScrollInterval - now.minute() % this.hourScrollInterval;

    // get the next quarter hour
    let rounded = now.add(remainer, "minutes").set("seconds", 0);

    this.dateArray.push(rounded.clone());

    this.optionArray.set(rounded.clone(), undefined);

    for (let i = 1; i < 15; i++) {
      // warning, we use the same 'rounded' variable
      const iterate = rounded.add(this.hourScrollInterval, "minutes");
      this.dateArray.push(iterate.clone());
      this.optionArray.set(iterate.clone(), undefined);
    }

    // get selected room
    this.adminService.selectedRoom$.subscribe((data) => {
      if (!data) {
        return console.error('no data');
      }
      console.log("admin obs room : " + data.name);
      this.selectedRoom = data;

    });
    // start the refresh loop
   // this.updateMeetingScrollList();
    this.refreshLoop = setInterval(() => this.refresh(), this.refreshInterval);
  }



  // refreshes the data on screen based on time
  refresh() {
    console.log('refresh');

    this.headerTime = moment();
    //refresh the meetings
    this.adminService.refreshMeetings().then((meetings) => {
      this.meetingList = meetings;
     // this.updateMeetingScrollList();

    });
  }

  // updateMeetingScrollList() {
  //   moment.locale("fr");
  //   if (this.meetingList) {
  //     if (this.meetingList.meetingList && this.meetingList.meetingList.length > 0) {
  //       const options = this.optionArray;

  //       this.meetingList.meetingList.forEach(function (m, index)  {
  //         const start = m.startDateTime;
  //         const end = m.endDateTime;

  //         for (let key of this.optionArray.keys()) {

  //           if(start>= key || end < key.clone().add(this.hourScrollInterval, "minutes")){
  //             this.optionArray.set(key, {
  //               state:States.OCCUPIED,
  //               meeting: m
  //             });
  //           }
  //         }
  //       }.bind(this));
  //     }
  //   }
  // }

  // getButtonState(dadate:moment.Moment) {

  //   if(this.optionArray){
  //     if(this.optionArray.has(dadate)){
  //       return this.optionArray.get(dadate)["state"];
  //     }
  //   }
  //   return States.OCCUPIED;
  // }

  // go to admin panel
  onAdminClicked() {
    // this.navCtrl.push(AdminPage);
    this.navCtrl.push(NfcCheckPage);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    // stop the refresh
    clearInterval(this.refreshLoop);
  }

  ngOnDestroy() {
    // stop the refresh
    clearInterval(this.refreshLoop);
  }
}
