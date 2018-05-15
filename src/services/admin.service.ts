import { GesroomService } from './gesroom.service';
import { MeetingList } from 'app/shared/meetingList';
import { Injectable } from '@angular/core';
import { Site } from 'app/shared/site';
import { Room } from 'app/shared/room';
import { Storage } from '@ionic/storage';


@Injectable()
export class AdminService {
  meetingList: MeetingList;
  selectedSite: Site;
  selectedRoom: Room;

  constructor(private storage: Storage, private gesroomService: GesroomService) {
    this.storage.get('selectedSite').then((data) => {
      console.log('selectedSite Storage : ' + data);
      if (data != null)
        this.selectedSite = JSON.parse(data);
    });

    this.storage.get('selectedRoom').then((data) => {
      if (data != null)
        this.selectedRoom = JSON.parse(data);
    });

  }

  setSelectedSite(site: Site): Room[]{
    let rooms: Room[] = [];
    this.selectedSite = site;

    this.gesroomService.getRooms(this.selectedSite).then(data => {
      console.log('Rooms:' + data.json());
      // ugly but couldn't figure a correct way to do it
      rooms = data.json().sort(this.roomCompare);
    });
    this.setToStorage('selectedSite', this.selectedSite);
    return rooms;
  }


  setSelectedRoom(room: Room) {
    this.selectedRoom = room;
    this.refreshMeetings();
    this.setToStorage('selectedRoom', this.selectedRoom);
  }

  // makes a call to get meetings based on the selected room
  refreshMeetings(): MeetingList{
    this.gesroomService.getMeetings(this.selectedRoom).then(data => {
      this.meetingList = data.json();
      console.log('meetings:' + this.meetingList);
    });
    return this.meetingList;
  }


  // utility to store with key
  setToStorage(key: string, object: any) {
    this.storage.set(key, JSON.stringify(object));
  }



  //ugly but...
  roomCompare = (a:object,b:object) => {
    if (a['name'] < b["name"])
      return -1;
    if (a["name"] > b["name"])
      return 1;
    return 0;
  };

}
