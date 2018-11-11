import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewMeetingPage } from './view-meeting';
import { ComponentsModule } from '../../components/components.module';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

@NgModule({
  declarations: [
    ViewMeetingPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewMeetingPage),
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
export class ViewMeetingPageModule {}


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
