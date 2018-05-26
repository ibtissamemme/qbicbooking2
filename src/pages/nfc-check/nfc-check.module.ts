import { ComponentsModule } from './../../components/components.module';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NfcCheckPage } from './nfc-check';

@NgModule({
  declarations: [
    NfcCheckPage,
  ],
  imports: [
    IonicPageModule.forChild(NfcCheckPage),
    ComponentsModule
  ],
})
export class NfcCheckPageModule {}
