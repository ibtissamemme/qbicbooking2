import { States } from './../../app/shared/meeting';
import { Component, Input, ViewEncapsulation } from '@angular/core';
import * as moment from "moment";


@Component({
  selector: "hour-scroll-button",
  templateUrl: "hour-scroll-button.html",
  encapsulation: ViewEncapsulation.None
})
export class HourScrollButtonComponent {
   @Input() date: moment.Moment;
  //  @Input() state: States;
  // buttonColor: string = "$primary";

  constructor() {
    // this.date = moment();
  }

  // getStateColor(): string {
  //   if (this.state === States.FREE) {
  //     return "$primary";
  //   } else if (this.state === States.OCCUPIED) {
  //     return "$danger";
  //   }
  // }
}
