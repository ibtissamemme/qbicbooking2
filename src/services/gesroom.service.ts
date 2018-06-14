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
    console.log(this.getSites());
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

    getMeetings(room: Room){
      if(room){

        return this.http
        .get(this.host + "/room_schedule/" + room.Id, this.setHeaders())
        .toPromise();
      }
    else return null;
    }
}
