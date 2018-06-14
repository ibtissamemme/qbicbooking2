import { Employee } from './employee';
import { Room } from './room';
import * as moment from "moment";

export enum States {
  FREE = 0,
  OCCUPIED = 1,
}


export class Meeting {

  id: number;
  attendies: Employee[];
  trainer: Employee;
  meetingName: string;
  meetingDescription: string;
  meetingType: any;
  meetingStatus: any;
  startDateTime: moment.Moment;
  endDateTime: moment.Moment;
  owner: Employee;
  room: Room;
  meetingReference: string;

  constructor(id: number, attendies: Employee[], trainer: Employee, meetingName: string,
    meetingDescription: string, meetingType: any, meetingStatus: any, startDateTime: moment.Moment,
    endDateTime: moment.Moment, owner: Employee, room: Room, meetingReference: string) {
    this.id = id;
    this.attendies = attendies;
    this.trainer = trainer;
    this.meetingName = meetingName;
    this.meetingDescription = meetingDescription;
    this.meetingType = meetingType;
    this.meetingStatus = meetingStatus;
    this.startDateTime = moment(startDateTime);
    this.endDateTime = moment(endDateTime);
    this.owner = owner;
    this.room = room;
    this.meetingReference = meetingReference;
  }

}


