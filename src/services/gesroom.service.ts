import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
// import { Http, Headers, RequestOptions } from "@angular/http";
import { Site, siteFromJson } from "../app/shared/site";
import { MeetingStatus, Meeting, meetingFromJSON } from '../app/shared/meeting';
import { Storage } from '@ionic/storage';
import { Room, roomFromJSON } from '../app/shared/room';
import { ENV } from '@app/env';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as moment from "moment";
import { Employee, EmployeeFromJSON } from "../app/shared/employee";

@Injectable()
export class GesroomService {
  ges_tablet: string;

  private endpoint: string;
  private userId: string;
  private apiKey: string;
  private tabletId: string;

  private apiKey2: string; //= "MEI97ZZ8POQFZZ2BIBWJPRNLSLPZ";
  private endpoint2: string; // = "http://safeware-custk.hds-group.com/TelemaqueRestAPI";
  private authToken: string;

  private endpointObs: BehaviorSubject<string>;
  get endpoint$(): Observable<string> {
    return this.endpointObs.asObservable();
  };

  private apiKeyObs: BehaviorSubject<string>;
  get apiKey$(): Observable<string> {
    return this.apiKeyObs.asObservable();
  };

  private userIdObs: BehaviorSubject<string>;
  get userId$(): Observable<string> {
    return this.userIdObs.asObservable();
  };

  private endpoint2Obs: BehaviorSubject<string>;
  get endpoint2$(): Observable<string> {
    return this.endpoint2Obs.asObservable();
  };

  private apiKey2Obs: BehaviorSubject<string>;
  get apiKey2$(): Observable<string> {
    return this.apiKey2Obs.asObservable();
  };

  constructor(private http: HttpClient, private storage: Storage, ) {
    this.endpointObs = new BehaviorSubject(undefined)
    this.apiKeyObs = new BehaviorSubject(undefined)
    this.endpoint2Obs = new BehaviorSubject(undefined)
    this.apiKey2Obs = new BehaviorSubject(undefined)
    this.userIdObs = new BehaviorSubject(undefined)
  }

  // generic parameter loading function
  // checks in local storage, and then in the environment files
  async loadParam(param: string) {
    let res: string;
    const data = await this.storage.get(param);
    if (!data) {
      if (!ENV[param]) {
        console.log(param, ' env : bad config');
        return;
      }
      res = ENV[param];
      console.log(param, ' storage : no data');
    } else {
      res = JSON.parse(data);
    }
    return res;
  }

  setHeaders(): HttpHeaders {
    // const reqHeaders = new Headers();
    // this.broadcaster.on("serialNumber").subscribe(ges_tablet => {
    //   this.ges_tablet = ges_tablet;
    // });
    const options = new HttpHeaders();
    options.append("GES_USERID", this.userId);
    options.append("GES_APIKEY", this.apiKey);
    options.append("GES_TABLET", "123456");
    options.append("Accept", "application/json");

    // headers.append("GES_USERID", this.sesaId);
    // headers.append("GES_APIKEY", this.adminDataServ.apiKey);
    // headers.append("GES_TABLET", this.ges_tablet);
    // headers.append("Accept", "application/json");

    return options;
  }

  setEndpoint(end: string) {
    this.endpointObs.next(end);
    this.setToStorage("endpoint", end);
    this.endpoint = end;
  }
  setApiKey(key: string) {
    this.apiKeyObs.next(key);
    this.setToStorage("apiKey", key);
    this.apiKey = key;
  }
  setUserId(id: string) {
    this.userIdObs.next(id);
    this.setToStorage("userId", id);
    this.userId = id;
  }
  setEndpoint2(end: string) {
    this.endpoint2Obs.next(end);
    this.setToStorage("endpoint2", end);
    this.endpoint2 = end;
  }
  setApiKey2(key: string) {
    this.apiKey2Obs.next(key);
    this.setToStorage("apiKey2", key);
    this.apiKey2 = key;
  }
  // utility to store with key
  setToStorage(key: string, object: any) {
    this.storage.set(key, JSON.stringify(object));
  }

  // checks and load API parameters
  // called at startup by the app.module.ts
  async setup() {
    if (!this.endpoint || !this.userId || !this.apiKey || !this.endpoint2 || !this.apiKey2) {
      this.endpoint = await this.loadParam('endpoint');
      this.userId = await this.loadParam('adminId');
      this.apiKey = await this.loadParam('apiKey');

      this.endpoint2 = await this.loadParam('endpoint2');
      this.apiKey2 = await this.loadParam('apiKey2');

      this.endpointObs.next(this.endpoint);
      this.userIdObs.next(this.userId)
      this.apiKeyObs.next(this.apiKey)
      //console.log("setup complete:",this.endpoint, this.apiKey, this.userId);
      this.endpoint2Obs.next(this.endpoint2);
      this.apiKey2Obs.next(this.apiKey2)

      this.authenticate();
    }

  }

  // **********************
  // **********************
  // new API
  // **********************
  // authentification
  // **********************
  async authenticate() {

    let reqHeaders = new HttpHeaders();
    // reqHeaders.append("Content-Type", 'application/x-www-form-urlencoded')
    reqHeaders = reqHeaders.append("Accept", "application/json");
    const options = {
      headers: reqHeaders
    };

    let body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', this.userId);
    body.set('password', this.userId);
    body.set('APIKeys', this.apiKey2);

    await this.http.post(this.endpoint2 + "/api/token", body.toString(), options).toPromise().then((data) => {
      if(data){
        this.authToken = data['access_token'];
      }
      // console.log(data.text());
      // console.log(this.authToken );
    });
  }

  // **********************
  // new API authorization header helper
  // **********************
  async setHeaders2()  {
    if (!this.authToken) {
      await this.authenticate();
    }
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Accept': 'application/json',
    //     'Authorization': `bearer ${this.authToken}`
    //   })
    // };
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/json');
    headers = headers.set('Authorization', `bearer ${this.authToken}`);
    const httpOptions = { headers: headers };
    return httpOptions;
  }



  // **********************
  // Data methods
  // **********************
  async getRoomPicture(room: Room) {
    return this.http.get(`${this.endpoint2}/api/Room/${room.Id}/Photo`, await this.setHeaders2()).toPromise();
  }

  // TODO fix this on API side...
  async getRoomCapacity(room: Room) {
    //return this.http.get(`${this.endpoint2}/api/RoomLayout/${room.Id}`, this.setHeaders2())
    let cap = 8;
    await this.http.get(`${this.endpoint2}/api/Room/${room.Id}/Layout`, await this.setHeaders2()).toPromise().then((data) => {
      cap = data['Capacity'];
    });

    return cap;
  }

  async getEmployeeDetails(corporateId: string, site: Site) {
    const resp = await this.http.get(`${this.endpoint2}/api/User?UserName=${corporateId}`, await this.setHeaders2()).toPromise();

    if (resp) {
      let ret: Employee
      if (Array.isArray(resp)) {
        // for some reason we get back an array
        ret = EmployeeFromJSON(resp[0]);
      } else {
        ret = EmployeeFromJSON(resp);
      }
      return ret;
    }
    return null;
  }

  async checkEmployeeRights(action: string, meeting: Meeting, emp: Employee): Promise<boolean> {
    const resp = await this.http.get<boolean>(`${this.endpoint2}/api/CheckRightMeeting?action=${action}&meetingId=${meeting.id}&userId=${emp.id}`, await this.setHeaders2()).toPromise();
    if (resp) {
      let ret: boolean = resp;
      return ret;
    }
    return undefined;
  }

  async checkRoomRights(room: Room, emp: Employee): Promise<boolean> {
    const resp = await this.http.get(`${this.endpoint2}/api/CheckRightRoom?roomId=${room.Id}&userId=${emp.id}`, await this.setHeaders2()).toPromise();
    if (resp) {
      let ret: boolean = resp=="true" ? true : false;
      return ret;
    }
    return undefined;
  }

  async getSites() {
    const sites = new Array<Site>();
    const resp = await this.http.get(`${this.endpoint2}/api/Site`, await this.setHeaders2()).toPromise();
    if (resp && Array.isArray(resp)) {
      resp.forEach(element => {
        sites.push(siteFromJson(element));
      });
    }
    return sites;
  }

  async getRooms(site: Site) {
    const rooms = new Array<Room>();
    try {
      const resp = await this.http
        .get(`${this.endpoint2}/api/Room?siteId=${site.Id}`, await this.setHeaders2())
        .toPromise();

        if (resp && Array.isArray(resp)) {
        resp.forEach(element => {
          rooms.push(roomFromJSON(element));
        });
      }
    } catch (error) {
      if(error.status !== 404){
        throw error;
      }
    }
    return rooms;
  }

  async getMeetings(room: Room) {
    const meetings = new Array<Meeting>();
    if (room) {
      const start = moment().startOf("day").format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      const end = moment().endOf("day").format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
      try {
        const resp = await this.http
          .get(`${this.endpoint2}/api/Meeting?roomId=${room.Id}&dateFrom=${start}&dateTo=${end}`, await this.setHeaders2())
          .toPromise();

        if (resp && Array.isArray(resp)) {
          resp.forEach(element => {
            meetings.push(meetingFromJSON(element));
          });
        }
      } catch (error) {
        // for the API, a 404 equals to no meeting
        if(error.status !== 404){
          throw error;
        }
      }
      return meetings;
    }
  }

  // getMeetings(room: Room) {
  //   if (room) {
  //     return this.http
  //       .get(this.endpoint + "/room_schedule/" + room.Id, this.setHeaders())
  //       .toPromise();
  //   }
  //   else return null;
  // }


  // only for the training page, get the URLs of the images to display of no training is available
  // TODO : refactor to call from the admin service
  getBackgroundImageForSite(site: Site) {
    return null;
    // return this.http
    //   .get(this.endpoint + "/sites/uris/", this.setHeaders()).toPromise();
  }


  /**
   * Creates a meeting
   * @param meeting
   */
  async postMeeting(meeting: Meeting) {
    const owner = meeting.owner;
    const room = meeting.room;
    return this.http.post(`${this.endpoint2}/api/Meeting`, {
      description: meeting.meetingDescription,
      meetingType: meeting.meetingType,
      completeStartDate: meeting.startDateTime,
      completeEndDate: meeting.endDateTime,
      host: {
        employeeId: owner._id,
        // corporateID: owner._corporateId,
        // firstName: owner._firstName,
        // lastName: owner._lastName,
        // company: owner.company
      },
      organizer: {
        employeeId: owner._id,
        // corporateID: owner._corporateId,
        // firstName: owner._firstName,
        // lastName: owner._lastName,
        // company: owner.company
      },
      createdBy: {
        employeeId: owner._id,
        // corporateID: owner._corporateId,
        // firstName: owner._firstName,
        // lastName: owner._lastName,
        // company: owner.company
      },
      room: {
        roomId: room.Id,
      },
      reference: meeting.meetingReference
    }, await this.setHeaders2()).toPromise();
  }

  async putMeeting(meeting: Meeting) {
    await this.http.put(`${this.endpoint2}/api/Meeting/` + meeting.id, {
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
      meetingStatus: meeting.meetingStatus,
    }, await this.setHeaders2()).toPromise();

  }

  // deleteMeetingOld(meeting: Meeting) {
  //   return this.http.put(this.endpoint + '/room_schedule/' + meeting.id, {
  //     startDateTime: meeting.startDateTime,
  //     endDateTime: meeting.endDateTime,
  //     meetingStatus: MeetingStatus.Cancelled
  //   }, this.setHeaders()).toPromise();
  // }

  async deleteMeeting(meeting: Meeting) {
    return this.http.delete(`${this.endpoint2}/api/Meeting/` + meeting.id, await this.setHeaders2()).toPromise();
  }

}




  // postMeeting(meeting: Meeting) {
  //   const owner = meeting.owner;
  //   const room = meeting.room;
  //   return this.http.post(this.endpoint + '/room_schedule', {
  //     meetingName: meeting.meetingName,
  //     meetingDescription: meeting.meetingDescription,
  //     meetingType: meeting.meetingType,
  //     startDateTime: meeting.startDateTime,
  //     endDateTime: meeting.endDateTime,
  //     owner: {
  //       id: owner._id,
  //       corporateID: owner._corporateId,
  //       firstName: owner._firstName,
  //       lastName: owner._lastName,
  //       company: owner.company,
  //       type: owner.type,
  //       status: owner.status
  //     },
  //     meetingStatus: meeting.meetingStatus,
  //     room: {
  //       Id: room.Id,
  //       name: room.name,
  //       localization: room.localization
  //     },
  //     meetingReference: meeting.meetingReference
  //   }, this.setHeaders()).toPromise();
  // }

  // putMeeting(meeting: Meeting) {
  //   return this.http.put(this.endpoint + '/room_schedule/' + meeting.id, {
  //     startDateTime: meeting.startDateTime,
  //     endDateTime: meeting.endDateTime,
  //     meetingStatus: meeting.meetingStatus,
  //   }, this.setHeaders()).toPromise();

  // }

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
