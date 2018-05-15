import { RequestOptions, Http } from "@angular/http";
import { Injectable } from "@angular/core";

@Injectable()
export class TabletService {
  private modelId;
  private timezone;
  private serialNum: string;
  private headers: Headers;
  private options: RequestOptions;

  constructor(private http: Http) {
    this.headers = new Headers({ "Content-Type": "application/json" });
    //this.options = new RequestOptions({ headers: this.headers });
  }

  public detectmob() {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true;
    } else {
      return false;
    }
  }


//   public changefrontled(r, g, b) {
//     if (this.detectmob()) {
//       this.http
//         .post(
//           "http://localhost:8080/v1/led/front_led",
//           JSON.stringify({ red: r, green: g, blue: b }),
//           this.options
//         )
//         .map((res: any) => res.json())
//         .subscribe(
//           data => {
//             console.log("success");
//           },
//           error => {
//             console.log(error);
//           }
//         );
//     }
//   }

//   public changeledbars(r, g, b) {
//     if (this.detectmob()) {
//       this.http
//         .post(
//           "http://localhost:8080/v1/led/led_bars",
//           JSON.stringify({ red: r, green: g, blue: b }),
//           this.options
//         )
//         .map((res: any) => res.json())
//         .subscribe(
//           data => {
//             console.log("success");
//           },
//           error => {
//             console.log(error);
//           }
//         );
//     }
//   }

//   public getmodelid() {
//     if (this.detectmob()) {
//       this.http
//         .get("http://localhost:8080/v1/public/info", this.options)
//         .map(res => res.json())
//         .subscribe(
//           data => {
//             this.modelId = data.results.model_id;
//           },
//           err => {
//             console.log(err);
//           }
//         );
//     }
//   }

//   public gettimezone() {
//     if (this.detectmob()) {
//       this.http
//         .get("http://localhost:8080/v1/settings/timezone", this.options)
//         .subscribe(
//           data => {
//             this.timezone = data["value"];
//           },
//           err => {
//             console.log(err);
//           }
//         );
//     }
//   }

//   public settimezone(name) {
//     if (this.detectmob()) {
//       this.http
//         .post(
//           "http://localhost:8080/v1/settings/timezone",
//           JSON.stringify({ value: name }),
//           this.options
//         )
//         .map((res: any) => res.json())
//         .subscribe(
//           data => {
//             console.log("success");
//           },
//           err => {
//             console.log(err);
//           }
//         );
//     }
//   }

//   public getserialnumber() {
//     if (this.detectmob()) {
//       this.http
//         .get("http://localhost:8080/v1/public/info", this.options)
//         .map(res => res.json())
//         .subscribe(
//           data => {
//             this.serialNum = data.results.serial_number;
//             this.broadcaster.broadcast("serialNumber", this.serialNum);
//           },
//           error => {
//             console.log(error);
//           }
//         );
//     }
//   }

//   public setscreenorientation(orientation) {
//     if (this.detectmob()) {
//       this.http
//         .post(
//           "http://localhost:8080/v1/settings/screen_orientation",
//           JSON.stringify({ value: orientation }),
//           this.options
//         )
//         .map((res: any) => res.json())
//         .subscribe(
//           data => {
//             console.log("success");
//           },
//           err => {
//             console.log(err);
//           }
//         );
//     }
//   }

//   public postTablet(id) {
//     this.http
//       .post(
//         this.adminDataServ.serviceUrl + "/tablet",
//         {
//           name: this.modelId,
//           ges_tablet: this.serialNum,
//           roomId: id,
//           tabletStatus: "Enabled"
//         },
//         this.headerService.setHeaders()
//       )
//       .map(res => res.json());
//   }

//   public get serialNumber() {
//     return this.serialNum;
//   }
}
