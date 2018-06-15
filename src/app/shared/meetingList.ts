import { Meeting } from './meeting';
import * as moment from "moment";


export class MeetingList{


    // Complete meeting list for this room
    meetingList: Meeting[] ;

    // returns a meeting matching a moment or null if no meeting is matching
    public getMeetingForTime(now:moment.Moment): Meeting{
        // const now:moment.Moment=moment();

        this.meetingList.forEach( (element) => {
            // look if we are inside the date interval
            // if (now > element.startDateTime && now < element.endDateTime) {
            //   return element;
            // }
        });
        return null;
    };

    sort(){
      if(this.meetingList){

        this.meetingList.map( (x) => {
          //force moment
          x.endDateTime=moment(x.endDateTime);
          x.startDateTime = moment(x.startDateTime);
        })
        this.meetingList.sort(this.compare);
      }
    }

    compare(a:object,b:object) {
      if (a['startDateTime'] < b["startDateTime"])
        return -1;
      if (a["startDateTime"] > b["startDateTime"])
        return 1;
      return 0;
    }

}
