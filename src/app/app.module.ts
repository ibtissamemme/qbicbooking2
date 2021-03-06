import { AndroidFullScreen } from '@ionic-native/android-full-screen';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ErrorHandler, NgModule, APP_INITIALIZER } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NFC, Ndef } from '@ionic-native/nfc';

import { StatusBar } from '@ionic-native/status-bar';
//import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { BookingPageModule } from './../pages/booking/booking.module';
import { AdminPageModule } from './../pages/admin/admin.module';
import { CheckPincodePageModule } from './../pages/check-pincode/check-pincode.module';
import { ViewMeetingPageModule } from './../pages/view-meeting/view-meeting.module';
import { TrainingPageModule } from './../pages/training/training.module';

import { GesroomService } from './../services/gesroom.service';
import { TabletService } from '../services/tablet.service';
import { AdminService } from '../services/admin.service';

import { ComponentsModule } from './../components/components.module';

import { IonicStorageModule } from '@ionic/storage';
import { NfcCheckPageModule } from './../pages/nfc-check/nfc-check.module';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TimeoutInterceptor, DEFAULT_TIMEOUT } from './utils/timeoutInterceptor';

// import * as Sentry from 'sentry-cordova';
// import { SentryIonicErrorHandler } from './SentryIonicErrorHandler';

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
   // HttpModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(MyApp, {mode: 'ios',statusbarPadding: false}),
    IonicStorageModule.forRoot(),
    ComponentsModule,
    BookingPageModule,
    AdminPageModule,
    CheckPincodePageModule,
    NfcCheckPageModule,
    TrainingPageModule,
    ViewMeetingPageModule,
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
    AndroidFullScreen,
    {
      provide: ErrorHandler,
      useClass: IonicErrorHandler
      // useClass: SentryIonicErrorHandler
    },
    NFC,
    Ndef,
    GesroomService,
    { provide: APP_INITIALIZER, useFactory: loadSettings,
        deps:[GesroomService],
        multi: true},
    TabletService,
    AdminService,
    { provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true },
    { provide: DEFAULT_TIMEOUT, useValue: 60000},
  ]
})
export class AppModule { }

// app init
export function loadSettings(gesroomService: GesroomService){
  return () => gesroomService.setup();
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Sentry.init({ dsn: 'https://d541f884f4be4551aad041a2ad3b1f6f@sentry.io/1306802' });
