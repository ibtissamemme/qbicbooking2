
import { NfcCheckPage } from './../pages/nfc-check/nfc-check';
import { AdminPage } from './../pages/admin/admin';
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

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AdminPage,
    NfcCheckPage,
  ],
  imports: [
    HttpModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    ComponentsModule,

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AdminPage,
    NfcCheckPage
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
