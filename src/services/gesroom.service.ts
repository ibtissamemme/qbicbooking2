import { Employee } from './../app/shared/employee';
import { Meeting } from 'app/shared/meeting';
import { TabletService } from "./tablet.service";
import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Site } from "../app/shared/site";
import { Room } from '../app/shared/room';

@Injectable()
export class GesroomService {
  ges_tablet: string;

  host: string = "http://safeware-custk.hds-group.com/GesroomRestAPI/Gesroom/API";

  constructor(private http: Http, private tabletService: TabletService) {
  }

  setHeaders(): RequestOptions {
    const reqHeaders = new Headers();
    // this.broadcaster.on("serialNumber").subscribe(ges_tablet => {
    //   this.ges_tablet = ges_tablet;
    // });

    reqHeaders.append("GES_USERID", "SESA65737");
    reqHeaders.append("GES_APIKEY", "MEI97ZZ8POQFZZ2BIBWJPRNLSLPZ");
    reqHeaders.append("GES_TABLET", "123456");
    reqHeaders.append("Accept", "application/json");
    // headers.append("GES_USERID", this.sesaId);
    // headers.append("GES_APIKEY", this.adminDataServ.apiKey);
    // headers.append("GES_TABLET", this.ges_tablet);
    // headers.append("Accept", "application/json");
    const options = new RequestOptions({ headers: reqHeaders });

    return options;
  }

  getSites() {
    return this.http.get(this.host + "/sites", this.setHeaders()).toPromise();
  }
  getSitesObs() {
    return this.http.get(this.host + "/sites", this.setHeaders());
  }
  getRooms(site: Site) {
    return this.http
      .get(this.host + "/" + site.Id + "/rooms", this.setHeaders())
      .toPromise();
  }
  getRoomsIbs(site: Site) {
    return this.http
      .get(this.host + "/" + site.Id + "/rooms", this.setHeaders());
  }

  getMeetings(room: Room) {
    if (room) {

      return this.http
        .get(this.host + "/room_schedule/" + room.Id, this.setHeaders())
        .toPromise();
    }
    else return null;
  }

  /**
   * Used upon pin entering for the booking screen
   * @param corporateId
   */
  getEmployeeById(corporateId: string) {
    const _corporateId = 'SESA' + corporateId;
    return this.http
      .get(this.host + "/persons/corporate/" + _corporateId , this.setHeaders())
      .toPromise();
    }



  /**
   * Creates a meeting
   * @param meeting
   */
  postMeeting(meeting: Meeting) {
    const owner = meeting.owner;
    const room = meeting.room;
    return this.http.post(this.host + '/room_schedule', {
      meetingName: meeting.meetingName,
      meetingDescription: meeting.meetingDescription,
      meetingType: meeting.meetingType,
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
      owner: {
        id: owner.id,
        corporateID: owner.corporateID,
        firstName: owner.firstName,
        lastName: owner.lastName,
        company: owner.company,
        type: owner.type,
        status: owner.status
      },
      meetingStatus: meeting.meetingStatus,
      room: {
        Id: room.Id,
        name: room.name,
        localization: room.localization
      },
      meetingReference: meeting.meetingReference
    }, this.setHeaders()).toPromise();
  }

  // putMeeting(meetingId, start, end) {
  //   this.http.put(this.adminDataServ.serviceUrl + '/room_schedule/' + meetingId, {
  //     startDateTime: start,
  //     endDateTime: end,
  //     meetingStatus: 'Started'
  //   }, this.headersService.setHeaders())
  //     .subscribe(() => {
  //       this.getMeetings();
  //     }, (error) => {
  //       this.toastr.error(error._body, 'Error!');
  //     });
  // }

  // deleteMeeting(meetingId, start, end) {
  //   this.http.put(this.adminDataServ.serviceUrl + '/room_schedule/' + meetingId, {
  //     startDateTime: start,
  //     endDateTime: end,
  //     meetingStatus: 'Cancelled'
  //   }, this.headersService.setHeaders()).map(response => response.json()).subscribe((jsonData) => {
  //     this.hourScrollServ.isHostCheckedIn = false;
  //     this.getMeetings();
  //     this.broadcastOnClear();
  //   }, (error) => {
  //     this.toastr.error(error._body, 'Error!');
  //   });
  // }

}
