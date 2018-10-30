import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckPincodePage } from './check-pincode';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import {ComponentsModule} from '../../components/components.module'

@NgModule({
  declarations: [
    CheckPincodePage,
  ],
  imports: [
    IonicPageModule.forChild(CheckPincodePage),
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
export class CheckPincodePageModule {}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
