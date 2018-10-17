import { BookingPageModule } from './../pages/booking/booking.module';
import { AdminPageModule } from './../pages/admin/admin.module';
import { TrainingPageModule } from './../pages/training/training.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NFC, Ndef } from '@ionic-native/nfc';

import { StatusBar } from '@ionic-native/status-bar';
import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { TabletService } from '../services/tablet.service';
import { GesroomService } from '../services/gesroom.service';
import { AdminService } from '../services/admin.service';

import { ComponentsModule } from './../components/components.module';

import { IonicStorageModule } from '@ionic/storage';
import { NfcCheckPageModule } from './../pages/nfc-check/nfc-check.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    // TrainingPage,
    // AdminPage,
    // NfcCheckPage,
    // BookingPage,
  ],
  imports: [
    HttpModule,
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(MyApp, {mode: 'ios'}),
    IonicStorageModule.forRoot(),
    ComponentsModule,
    BookingPageModule,
    AdminPageModule,
    NfcCheckPageModule,
    TrainingPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    // TrainingPage,
    // AdminPage,
    // NfcCheckPage,
    // BookingPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    NFC,
    Ndef,
    GesroomService,
    TabletService,
    AdminService
  ]
})
export class AppModule { }


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
