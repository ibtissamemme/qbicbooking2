import { RoomType } from "./../app/shared/room";
import { GesroomService } from "./gesroom.service";
import { MeetingList } from "../../src/app/shared/meetingList";
import { Injectable } from "@angular/core";
import { Site } from "app/shared/site";
import { Room } from "app/shared/room";
import { Storage } from "@ionic/storage";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { ENV } from "@app/env";

@Injectable()
export class AdminService {
  meetingList: MeetingList;
  selectedSite: Site;
  selectedRoom: Room;
  isBookingEnabled: boolean;
  isPinInClearText: boolean;
  private _bookingStartHour: number;
  private _bookingEndHour: number = 20;
  hourScrollInterval: number = 15;

  // TODO put that in the env file
  corporateIdRadical: string = "SESA";

  private selectedRoomObs: BehaviorSubject<Room>;
  get selectedRoom$(): Observable<Room> {
    return this.selectedRoomObs.asObservable();
  }

  private selectedSiteObs: BehaviorSubject<Site>;
  get selectedSite$(): Observable<Site> {
    return this.selectedSiteObs.asObservable();
  }

  private meetingListObs: BehaviorSubject<MeetingList>;
  get meetingList$(): Observable<MeetingList> {
    return this.meetingListObs.asObservable();
  }

  private slidesAvailableObs: BehaviorSubject<Site>;
  get slidesAvailable$(): Observable<Site> {
    return this.slidesAvailableObs.asObservable();
  }

  private isBookingEnabledObs: BehaviorSubject<boolean>;
  get isBookingEnabled$(): Observable<boolean> {
    return this.isBookingEnabledObs.asObservable();
  }

  private isPinInClearTextObs: BehaviorSubject<boolean>;
  get isPinInClearText$(): Observable<boolean> {
    return this.isPinInClearTextObs.asObservable();
  }

  private bookingStartHourObs: BehaviorSubject<number>;
  get bookingStartHour$(): Observable<number> {
    return this.bookingStartHourObs.asObservable();
  }
  private bookingEndHourObs: BehaviorSubject<number>;
  get bookingEndHour$(): Observable<number> {
    return this.bookingEndHourObs.asObservable();
  }

  constructor(
    private storage: Storage,
    private gesroomService: GesroomService
  ) {
    this.selectedSiteObs = new BehaviorSubject(undefined);
    this.selectedRoomObs = new BehaviorSubject(undefined);
    this.meetingListObs = new BehaviorSubject(undefined);
    this.slidesAvailableObs = new BehaviorSubject(undefined);
    this.meetingList = new MeetingList();

    this.isBookingEnabledObs = new BehaviorSubject(undefined);
    this.isPinInClearTextObs = new BehaviorSubject(undefined);
    this.bookingStartHourObs = new BehaviorSubject(undefined);
    this.bookingEndHourObs = new BehaviorSubject(undefined);

    this.storage.get("selectedSite").then(data => {
      if (!data) {
        return;
      }
      // console.log('selectedRoom Storage : ' + data);
      this.selectedSite = JSON.parse(data);
      this.selectedSiteObs.next(this.selectedSite);
    });

    this.storage.get("selectedRoom").then(data => {
      if (!data) {
        return;
      }
      //console.log('selectedRoom Storage : ' + data);
      this.selectedRoom = JSON.parse(data);
      this.selectedRoomObs.next(this.selectedRoom);
      this.checkSlides();
    });

    this.storage.get("isPinInClearText").then((data: string) => {
      console.log("isPinInClearText storage", data);

      if (data === null) {
        let that = this;
        that.loadParam("isPinInClearText").then(data2 => {
          that.isPinInClearText = data2.toLowerCase() == "true" ? true : false;
          that.isPinInClearTextObs.next(that.isPinInClearText);
        });
        return;
      }
      this.isPinInClearText = data.toLowerCase() == "true" ? true : false;
      this.isPinInClearTextObs.next(this.isPinInClearText);
    });

    this.storage.get("isBookingEnabled").then(data => {
      if (!data) {
        return;
      }
      //console.log('booking Storage : ' + data);
      this.isBookingEnabled = data;
      this.isBookingEnabledObs.next(this.isBookingEnabled);
    });
    const that = this;
    this.storage
      .get("bookingStartHour")
      .then(async data => {
        if (!data) {
          let value = Number.parseInt(await that.loadParam("bookingStartHour"));
          if(!Number.isInteger(value)){
            value = 7;
          }
          return value;
        }
        return data;
      })
      .then(data => {
        //console.log('booking Storage : ' + data);
        that._bookingStartHour = Number.parseInt(data);
        that.bookingStartHourObs.next(that._bookingStartHour);
        //console.log("_bookingStartHour", that._bookingStartHour);
      })
      .catch(e => {
        console.error(e);
      });

    this.storage
      .get("bookingEndHour")
      .then(async data => {
        if (!data) {
          let value = Number.parseInt(await that.loadParam("bookingEndHour"));
          if(!Number.isInteger(value)){
            value = 20;
          }
          return value;
        }
        return data;
      })
      .then(data => {
        //console.log('booking Storage : ' + data);
        that._bookingEndHour = Number.parseInt(data);
        that.bookingEndHourObs.next(that._bookingEndHour);
        console.log("_bookingEndHour", that._bookingEndHour);
      })
      .catch(e => {
        console.error(e);
      });
  }



  setSelectedSite(site: Site) {
    let rooms: Room[] = [];
    this.selectedSite = site;

    // push to all
    this.selectedSiteObs.next(site);
    this.setToStorage("selectedSite", this.selectedSite);
    console.log("set to storage SITE => " + this.selectedSite.name);

    // this.gesroomService.getRooms(this.selectedSite).then(data => {
    //   // ugly but couldn't figure a correct way to do it
    //   rooms = data.json().sort((a, b) => a.name.localeCompare(b.name));
    // });

    // return rooms;
  }

  setSelectedRoom(room: Room) {
    this.selectedRoomObs.next(room);
    this.refreshMeetings();
    this.setToStorage("selectedRoom", room);

    this.selectedRoom = room;
    this.checkSlides();
  }

  setIsBookingEnabled(isBooking: boolean) {
    this.isBookingEnabledObs.next(isBooking);
    this.setToStorage("isBookingEnabled", isBooking);
    this.isBookingEnabled = isBooking;
  }

  setisPinInClearText(isBooking: boolean) {
    this.isPinInClearTextObs.next(isBooking);
    this.setToStorage("isPinInClearText", isBooking);
    this.isPinInClearText = isBooking;
  }

  setBookingStartHour(hour: number) {
    this.bookingStartHourObs.next(hour);
    this.setToStorage("bookingStartHour", hour);
    this._bookingStartHour = hour;
  }

  setBookingEndHour(hour: number) {
    this.bookingEndHourObs.next(hour);
    this.setToStorage("bookingEndHour", hour);
    this._bookingEndHour = hour;
  }

  // makes a call to get meetings based on the selected room
  refreshMeetings() {
    if (this.selectedRoomObs.getValue()) {
      this.gesroomService
        .getMeetings(this.selectedRoomObs.getValue())
        .then(data => {
          if (data ) {
            this.meetingList.meetingList = data;
            this.meetingList.sort();
            this.meetingListObs.next(this.meetingList);
            if (Array.isArray(this.meetingList.meetingList)) {
              this.meetingList.meetingList.map(m =>
                console.log(
                  m.id,
                  m.meetingStatus,
                  m.startDateTime.format("lll"),
                  "=>",
                  m.endDateTime.format("lll")
                )
              );
            }
          }
          return this.meetingList.meetingList;
        });
    }
  }

  // utility to store with key
  setToStorage(key: string, object: any) {
    this.storage.set(key, JSON.stringify(object));
  }

  checkSlides() {
    if (this.selectedRoom.roomType === RoomType.Training) {
      try {
        this.gesroomService
          .getBackgroundImageForSite(this.selectedSite)
          .then(data => {
            this.selectedSite.slides = new Array();
            if (
              data &&
              data.ok &&
              typeof data == typeof this.selectedSite.slides
            ) {
              this.selectedSite.slides = JSON.parse(data.text());
              this.slidesAvailableObs.next(this.selectedSite);
            }
          });
      } catch (error) {
        console.error(error);
      }
    }
  }

  //ugly but...
  roomCompare = (a: Room, b: Room) => {
    a.name.localeCompare(b.name);
  };

  // check the admin code for admin access panel
  // admin code is set in the environment params
  isAdminAuthorized(corporateID: string): boolean {
    if (corporateID === ENV.adminCode) {
      return true;
    } else {
      return false;
    }
  }

  // TODO: refactor to somewhere else
  // generic parameter loading function
  // checks in local storage, and then in the environment files
  async loadParam(param: string) {
    let res: string;
    const data = await this.storage.get(param);
    if (!data) {
      if (!ENV[param]) {
        console.log(param, "env : bad config");
        return;
      }
      res = ENV[param];
      console.log(param, "storage : no data");
    } else {
      res = JSON.parse(data);
    }
    return res;
  }
}
