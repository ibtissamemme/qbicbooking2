import { PincodeInputComponent } from './../../components/pincode-input/pincode-input';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingPage } from './booking';
import {ComponentsModule} from '../../components/components.module'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
@NgModule({
  declarations: [
    BookingPage,
  ],
  imports: [
    IonicPageModule.forChild(BookingPage),
    ComponentsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
})
export class BookingPageModule {}


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
