import { Meeting } from 'app/shared/meeting';
import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { Site } from "../app/shared/site";
import { Storage } from '@ionic/storage';
import { Room } from '../app/shared/room';
import { ENV } from '@app/env';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { ThrowStmt } from '@angular/compiler';

@Injectable()
export class GesroomService {
  ges_tablet: string;

  private endpoint: string;
  private userId: string;
  private apiKey: string;
  private tabletId: string;

  private apiKey2: string = "MEI97ZZ8POQFZZ2BIBWJPRNLSLPZ";
  private endpoint2: string = "http://safeware-custk.hds-group.com/TelemaqueRestAPI";
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

  constructor(private http: Http, private storage: Storage, ) {
    this.endpointObs = new BehaviorSubject(undefined)
    this.apiKeyObs = new BehaviorSubject(undefined)
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

  setHeaders(): RequestOptions {
    const reqHeaders = new Headers();
    // this.broadcaster.on("serialNumber").subscribe(ges_tablet => {
    //   this.ges_tablet = ges_tablet;
    // });
    reqHeaders.append("GES_USERID", this.userId);
    reqHeaders.append("GES_APIKEY", this.apiKey);
    reqHeaders.append("GES_TABLET", "123456");
    reqHeaders.append("Accept", "application/json");
    const options = new RequestOptions({ headers: reqHeaders });
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

  // utility to store with key
  setToStorage(key: string, object: any) {
    this.storage.set(key, JSON.stringify(object));
  }

  // checks and load API parameters
  // called at startup by the app.module.ts
  async setup() {
    if (!this.endpoint || !this.userId || !this.apiKey) {
      this.endpoint = await this.loadParam('endpoint');
      this.userId = await this.loadParam('adminId');
      this.apiKey = await this.loadParam('apiKey');

      this.endpointObs.next(this.endpoint);
      this.userIdObs.next(this.userId)
      this.apiKeyObs.next(this.apiKey)
      //console.log("setup complete:",this.endpoint, this.apiKey, this.userId);

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
    const reqHeaders = new Headers();
    // reqHeaders.append("Content-Type", 'application/x-www-form-urlencoded')
    reqHeaders.append("Accept", "application/json");
    const options = new RequestOptions({ headers: reqHeaders });

    let body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('username', this.userId);
    body.set('password', this.userId);
    body.set('APIKeys', this.apiKey2);

    await this.http.post(this.endpoint2 + "/api/token", body.toString(), options).toPromise().then((data) => {
      this.authToken = JSON.parse(data.text())['access_token'];
      // console.log(data.text());
      // console.log(this.authToken );
    });
  }

  // **********************
  // new API authorization header helper
  // **********************
  async setHeaders2(): Promise<RequestOptions>{
    if(!this.authToken){
      await this.authenticate();
    }
    const reqHeaders = new Headers();
    // reqHeaders.append("Content-Type", 'application/x-www-form-urlencoded')
    reqHeaders.append("Accept", "application/json");
    reqHeaders.append("Authorization", "bearer " + this.authToken);
    const options = new RequestOptions({ headers: reqHeaders });
    return options;
  }


  // **********************
  // Data methods
  // **********************
  async getRoomPicture(room:Room){
    return this.http.get(`${this.endpoint2}/api/Room/${room.Id}/Photo`, await this.setHeaders2()).toPromise();
  }

  // TODO fix this on API side...
  async getRoomCapacity(room:Room){
    //return this.http.get(`${this.endpoint2}/api/RoomLayout/${room.Id}`, this.setHeaders2())
    let cap=8;
    await this.http.get(`${this.endpoint2}/api/Room/${room.Id}/Layout`, await this.setHeaders2()).toPromise().then( (data) => {
      cap = JSON.parse(data.text())[0].Capacity;
    } );

    return cap;
  }
  async getEmployeeDetails(corporateId: string, site: Site){
    return this.http.get(`${this.endpoint2}/api/PersonVisited?corporateId=${corporateId}`, await this.setHeaders2()).toPromise();
  }


  // OLD API Methods
  getSites() {
    return this.http.get(this.endpoint + "/sites", this.setHeaders()).toPromise();
  }
  getSitesObs() {
    return this.http.get(this.endpoint + "/sites", this.setHeaders());
  }
  getRooms(site: Site) {

    return this.http
      .get(this.endpoint + "/" + site.Id + "/rooms", this.setHeaders())
      .toPromise();
  }
  getRoomsIbs(site: Site) {
    return this.http
      .get(this.endpoint + "/" + site.Id + "/rooms", this.setHeaders());
  }

  getMeetings(room: Room) {
    if (room) {
      return this.http
        .get(this.endpoint + "/room_schedule/" + room.Id, this.setHeaders())
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
      .get(this.endpoint + "/persons/persons?email=saf-mat%40safewarehds.onmicrosoft.com", this.setHeaders())
      .toPromise();
    // return this.http
    //   .get(this.endpoint + "/persons/corporate/" + _corporateId , this.setHeaders())
    //   .toPromise();
  }


  // only for the training page, get the URLs of the images to display of no training is available
  // TODO : refactor to call from the admin service
  getBackgroundImageForSite(site: Site) {
    return this.http
      .get(this.endpoint + "/sites/uris/", this.setHeaders()).toPromise();
  }


  /**
   * Creates a meeting
   * @param meeting
   */
  postMeeting(meeting: Meeting) {
    const owner = meeting.owner;
    const room = meeting.room;
    return this.http.post(this.endpoint + '/room_schedule', {
      meetingName: meeting.meetingName,
      meetingDescription: meeting.meetingDescription,
      meetingType: meeting.meetingType,
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
      owner: {
        id: owner._id,
        corporateID: owner._corporateId,
        firstName: owner._firstName,
        lastName: owner._lastName,
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

  putMeeting(meeting: Meeting) {
    return this.http.put(this.endpoint + '/room_schedule/' + meeting.id, {
      startDateTime: meeting.startDateTime,
      endDateTime: meeting.endDateTime,
      meetingStatus: meeting.meetingStatus,
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
  //     this.hourScrollServ.isendpointCheckedIn = false;
  //     this.getMeetings();
  //     this.broadcastOnClear();
  //   }, (error) => {
  //     this.toastr.error(error._body, 'Error!');
  //   });
  // }

}
