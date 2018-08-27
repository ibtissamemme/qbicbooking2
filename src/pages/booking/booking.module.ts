import { PincodeInputComponent } from './../../components/pincode-input/pincode-input';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingPage } from './booking';
import {ComponentsModule} from '../../components/components.module'
@NgModule({
  declarations: [
    BookingPage,
  ],
  imports: [
    IonicPageModule.forChild(BookingPage),
    ComponentsModule
  ],
})
export class BookingPageModule {}
