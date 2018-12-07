import { States } from './../app/shared/meeting';
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ENV } from '@app/env';

@Injectable()
export class TabletService {
  private modelId;
  private timezone;
  private serialNum: string;
  private headers: HttpHeaders;
  private options;
  private status: States;
  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders();
    this.headers.append( "Content-Type", "application/json" )
    this.options = { headers: this.headers };

  }

  // Simple handler for changeing LED colors
  public changeLED(bookingStatus:States){
    if(!ENV.colors){
      return;
    }
    if(this.status === bookingStatus){
      return;
    }

    this.status = bookingStatus;

    let coco = ENV.ledColors.primary;
    switch (bookingStatus) {
      case States.PENDING:
      coco = ENV.ledColors.secondary;
      break;
      case States.OCCUPIED:
      coco = ENV.ledColors.danger;
      break;
      default:
        coco = ENV.ledColors.primary;
        break;
    }
    this.changefrontled(coco.r, coco.g, coco.b);
    this.changeledbars(coco.r, coco.g, coco.b);
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


  public changefrontled(r, g, b) {
    if (this.detectmob()) {
      this.http
        .post(
          "http://localhost:8080/v1/led/front_led",
          JSON.stringify({ red: r, green: g, blue: b }),
          this.options
        )
        .subscribe(
          data => {
            //console.log("success");
          },
          error => {
           //console.log(error);
          }
        );
    }
  }

  public changeledbars(r, g, b) {
    if (this.detectmob()) {
      this.http
        .post(
          "http://localhost:8080/v1/led/led_bars",
          JSON.stringify({ red: r, green: g, blue: b }),
          this.options
        )
        .subscribe(
          data => {
            //console.log("success");
          },
          error => {
            //console.log(error);
          }
        );
    }
  }

  public getmodelid() {
    if (this.detectmob()) {
      this.http
        .get("http://localhost:8080/v1/public/info", this.options)
        .subscribe(
          data => {
            this.modelId = data;
          },
          err => {
            console.log(err);
          }
        );
    }
  }

  public gettimezone() {
    if (this.detectmob()) {
      this.http
        .get("http://localhost:8080/v1/settings/timezone", this.options)
        .subscribe(
          data => {
            this.timezone = data["value"];
          },
          err => {
            //console.log(err);
          }
        );
    }
  }

  public settimezone(name) {
    if (this.detectmob()) {
      this.http
        .post(
          "http://localhost:8080/v1/settings/timezone",
          JSON.stringify({ value: name }),
          this.options
        )
        .subscribe(
          data => {
            //console.log("success");
          },
          err => {
            //console.log(err);
          }
        );
    }
  }
  public rebootTablet(){
    this.http
    .post(  "http://localhost:8080/v1/reboot"
     , this.options
    )
    .subscribe(
      data => {
        //console.log("success");
      },
      error => {
        //console.log(error);
      }
    );
  }
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
