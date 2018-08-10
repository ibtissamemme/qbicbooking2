import { NfcCheckPage } from 'pages/nfc-check/nfc-check';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrainingPage } from './training';

@NgModule({
  declarations: [
    TrainingPage,
  ],
  imports: [
    NfcCheckPage,
    IonicPageModule.forChild(TrainingPage),
  ],
})
export class TrainingPageModule {}
