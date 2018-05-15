import { States } from './../../app/shared/meeting';
import { Component, Input } from '@angular/core';
import * as moment from "moment";

/**
 * Generated class for the HourScrollButtonComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "hour-scroll-button",
  templateUrl: "hour-scroll-button.html"
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
