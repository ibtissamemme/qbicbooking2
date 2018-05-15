import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NfcCheckPage } from './nfc-check';

@NgModule({
  declarations: [
    NfcCheckPage,
  ],
  imports: [
    IonicPageModule.forChild(NfcCheckPage),
  ],
})
export class NfcCheckPageModule {}
