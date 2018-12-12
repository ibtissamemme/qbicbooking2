import { Employee, EmployeeFromJSON } from './employee';
import { Room } from './room';
import * as moment from "moment";

export enum States {
  FREE = 0,
  OCCUPIED = 1,
  PENDING = 2,
}

export enum MeetingStatus{
  NotStarted = 0,
  Started = 1,
  Cancelled = 2
}

export enum MeetingType {
  Meeting = 0,
  Training = 1
}


export interface MeetingConstructorInput {
  id: number,
  attendies?: Employee[],
  trainer?: Employee,
  meetingName?: string,
  meetingDescription?: string,
  meetingType?: any,
  meetingStatus?: any,
  startDateTime: moment.Moment,
  endDateTime: moment.Moment,
  owner?: Employee,
  room?: Room,
  meetingReference?: string
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

  constructor(input: MeetingConstructorInput) {
    this.id = input.id;
    this.attendies = input.attendies;
    this.trainer = input.trainer;
    this.meetingName = input.meetingName;
    this.meetingDescription = input.meetingDescription;
    this.meetingType = input.meetingType;
    this.meetingStatus = input.meetingStatus;
    this.startDateTime = moment(input.startDateTime);
    this.endDateTime = moment(input.endDateTime);
    this.owner = input.owner;
    this.room = input.room;
    this.meetingReference = input.meetingReference;
  }
}

export function meetingFromJSON(input: Object) {
  const attendies = new Array<Employee>();

  if(Array.isArray(input['Attendees'])){
    input['Attendees'].forEach(element => {
      attendies.push(EmployeeFromJSON(element));
    });
  }

  if(Array.isArray(input['attendees'])){
    input['attendees'].forEach(element => {
      attendies.push(EmployeeFromJSON(element));
    });
  }
  const owner = EmployeeFromJSON(input['host']);

  let temp: MeetingConstructorInput = {
    id: input['meetingId'],
    attendies: attendies,
    owner: owner,
    startDateTime: moment(input['meetingStartDate'], 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    endDateTime: moment(input['meetingEndDate'], 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
  };

  return new Meeting(temp);
}

// {
//   "Trainer": {
//     "AttendeeId": "string",
//     "PersonVisitedId": "string",
//     "VisitorId": "string",
//     "PersonVisitedLogin": "string",
//     "LastName": "string",
//     "FirstName": "string",
//     "Company": "string",
//     "Email": "string",
//     "AttendeeStatus": "string",
//     "AttendeeType": "string"
//   },
//   "Attendees": [
//     {
//       "AttendeeId": "string",
//       "PersonVisitedId": "string",
//       "VisitorId": "string",
//       "PersonVisitedLogin": "string",
//       "LastName": "string",
//       "FirstName": "string",
//       "Company": "string",
//       "Email": "string",
//       "AttendeeStatus": "string",
//       "AttendeeType": "string"
//     }
//   ],
//   "MeetingId": "string",
//   "MeetingStatusId": "string",
//   "ExternalId": "string",
//   "RoomId": "string",
//   "MeetingDetailId": "string",
//   "CompleteStartDate": "2018-11-16T14:20:05.201Z",
//   "CompleteEndDate": "2018-11-16T14:20:05.201Z"
// }

