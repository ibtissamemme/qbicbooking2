import { NgModule } from '@angular/core';
import { HourScrollButtonComponent } from './hour-scroll-button/hour-scroll-button';
import { PincodeInputComponent } from './pincode-input/pincode-input';

import { CommonModule } from "@angular/common";
import { IonicModule } from 'ionic-angular';


import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
	declarations: [HourScrollButtonComponent,
    PincodeInputComponent ],
  imports: [
    IonicModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })],
	exports: [HourScrollButtonComponent,
    PincodeInputComponent]
})
export class ComponentsModule {}


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
