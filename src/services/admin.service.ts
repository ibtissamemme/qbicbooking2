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


  constructor(private storage: Storage, private gesroomService: GesroomService) {
    this.selectedSiteObs = new BehaviorSubject(undefined);
    this.selectedRoomObs = new BehaviorSubject(undefined);
    this.meetingListObs = new BehaviorSubject(undefined);
    this.meetingList = new MeetingList();

    this.storage.get('selectedSite').then((data) => {
      if (!data) {
      return console.log('selectedSite Storage : no data');
      }
      console.log('selectedRoom Storage : ' + data);
      let _selectedSite: Site = JSON.parse(data);
      this.selectedSiteObs.next(_selectedSite);
    }
    );


    this.storage.get('selectedRoom').then((data) => {
      if (!data) {
        return console.log('selectedRoom Storage : no data');
      }
      console.log('selectedRoom Storage : ' + data);
      let _selectedRoom: Room = JSON.parse(data);
      this.selectedRoomObs.next(_selectedRoom);
    }
    );

  }

  setSelectedSite(site: Site) {
    let rooms: Room[] = [];
    this.selectedSite = site;

    // push to all
    this.selectedSiteObs.next(site);
    this.setToStorage('selectedSite', this.selectedSite);
    console.log("set to storage SITE => "+ this.selectedSite.name);

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
    console.log("set to storage ROOM => "+ room.name);
  }

  // makes a call to get meetings based on the selected room
  async refreshMeetings(): Promise<MeetingList> {
    if (this.selectedRoomObs.getValue()) {

      await this.gesroomService.getMeetings(this.selectedRoomObs.getValue()).then(data => {
        if(data){
          this.meetingList.meetingList = data.json();
          this.meetingList.sort();
          this.meetingListObs.next(this.meetingList);

          console.log('meetings:' );
          console.table( this.meetingList.meetingList);
        }
      });
      this.meetingList.sort();
      return this.meetingList;
    }
  }


  // utility to store with key
  setToStorage(key: string, object: any) {
    this.storage.set(key, JSON.stringify(object));
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
