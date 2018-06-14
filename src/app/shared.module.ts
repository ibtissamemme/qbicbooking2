import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { MeetingList } from './shared/meetingList';
import { Meeting } from 'app/shared/meeting';
import { Room } from 'app/shared/room';
import { Site } from "./shared/site";

@NgModule({
	declarations: [Site, Room, Meeting ],
	imports: [IonicModule],
	exports: [Site, Room, Meeting ]
})
export class SharedModule {}
