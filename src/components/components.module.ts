import { NgModule } from '@angular/core';
import { HourScrollButtonComponent } from './hour-scroll-button/hour-scroll-button';
import { PincodeInputComponent } from './pincode-input/pincode-input';

import { CommonModule } from "@angular/common";
import { IonicModule } from 'ionic-angular';


@NgModule({
	declarations: [HourScrollButtonComponent,
    PincodeInputComponent ],
	imports: [IonicModule, CommonModule],
	exports: [HourScrollButtonComponent,
    PincodeInputComponent]
})
export class ComponentsModule {}
