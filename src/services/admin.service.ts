import { RoomType } from './../app/shared/room';
import { GesroomService } from './gesroom.service';
import { MeetingList } from '../../src/app/shared/meetingList';
import { Injectable } from '@angular/core';
import { Site } from 'app/shared/site';
import { Room } from 'app/shared/room';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class AdminService {
  meetingList: MeetingList;
  selectedSite: Site;
  selectedRoom: Room;
  hourScrollInterval: number = 15;

  private selectedRoomObs: BehaviorSubject<Room>;
  get selectedRoom$(): Observable<Room> {
    return this.selectedRoomObs.asObservable();
  };

  private selectedSiteObs: BehaviorSubject<Site>;
  get selectedSite$(): Observable<Site> {
    return this.selectedSiteObs.asObservable();
  };

  private meetingListObs: BehaviorSubject<MeetingList>;
  get meetingList$(): Observable<MeetingList> {
    return this.meetingListObs.asObservable();
  };

  private slidesAvailableObs: BehaviorSubject<Site>;
  get slidesAvailable$(): Observable<Site> {
    return this.slidesAvailableObs.asObservable();
  }

  constructor(private storage: Storage, private gesroomService: GesroomService) {
    this.selectedSiteObs = new BehaviorSubject(undefined);
    this.selectedRoomObs = new BehaviorSubject(undefined);
    this.meetingListObs = new BehaviorSubject(undefined);
    this.slidesAvailableObs = new BehaviorSubject(undefined);
    this.meetingList = new MeetingList();

    this.storage.get('selectedSite').then((data) => {
      if (!data) {
        return console.log('selectedSite Storage : no data');
      }
      console.log('selectedRoom Storage : ' + data);
      this.selectedSite = JSON.parse(data);
      this.selectedSiteObs.next(this.selectedSite);
    }
    );


    this.storage.get('selectedRoom').then((data) => {
      if (!data) {
        return console.log('selectedRoom Storage : no data');
      }
      console.log('selectedRoom Storage : ' + data);
      this.selectedRoom = JSON.parse(data);
      this.selectedRoomObs.next(this.selectedRoom);
      this.checkSlides();
    }
    );

  }

  setSelectedSite(site: Site) {
    let rooms: Room[] = [];
    this.selectedSite = site;

    // push to all
    this.selectedSiteObs.next(site);
    this.setToStorage('selectedSite', this.selectedSite);
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
    this.setToStorage('selectedRoom', room);

    this.selectedRoom = room;
    console.log("set to storage ROOM => " + room.name);
    this.checkSlides();
  }

  // makes a call to get meetings based on the selected room
  refreshMeetings() {
    if (this.selectedRoomObs.getValue()) {
      this.gesroomService.getMeetings(this.selectedRoomObs.getValue()).then(data => {
        if (data && data.ok) {
          this.meetingList.meetingList = data.json();
          this.meetingList.sort();
          this.meetingListObs.next(this.meetingList);
          if(Array.isArray(this.meetingList.meetingList)){
            this.meetingList.meetingList.map( (m) => console.log(m.id, m.meetingStatus, m.startDateTime.format("lll"), "=>", m.endDateTime.format("lll")) );
          }
        }
        return this.meetingList.meetingList;
      }, reason => console.error(reason)
      );

    }
  }


  // utility to store with key
  setToStorage(key: string, object: any) {
    this.storage.set(key, JSON.stringify(object));
  }

  checkSlides() {
    if (this.selectedRoom.roomType === RoomType.Training) {
      try {
        this.gesroomService.getBackgroundImageForSite(this.selectedSite)
          .then((data) => {
            this.selectedSite.slides = new Array();
            if (data && data.ok && typeof (data) == typeof (this.selectedSite.slides)) {
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


  isUserAuthorized(corporateID: string): boolean {
    if (corporateID === '123456') {
      return false;
    }
    else return true;
  }
}
