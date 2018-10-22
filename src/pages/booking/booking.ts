import { Employee } from './../../app/shared/employee';
import { Meeting, MeetingType, MeetingStatus } from './../../app/shared/meeting';
import { GesroomService } from './../../services/gesroom.service';
import { Room } from 'app/shared/room';
import { LoadingController, ViewController } from 'ionic-angular';
import { AdminService } from './../../services/admin.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import * as moment from "moment";


@IonicPage()
@Component({
  selector: 'page-booking',
  templateUrl: 'booking.html',
})
export class BookingPage {
  start: moment.Moment = this.navParams.get('start');
  end: moment.Moment = this.navParams.get('end');
  room: Room = this.navParams.get('room');

  emp: Employee = null;

  constructor(public navCtrl: NavController, public navParams: NavParams, public adminService: AdminService, private alertCtrl: AlertController, public viewCtrl: ViewController, private loadingCtrl: LoadingController, private gesroomService: GesroomService) {
  }

  ionViewDidLoad() {
  }


  async onPinSubmit(pinCode: string) {
    console.log(pinCode);
    const loadingEmployee = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Recherche de votre compte...',
    });
    loadingEmployee.present();

    const corporateId = 'SESA' + pinCode;
    const site=this.adminService.selectedSite;
    //await this.gesroomService.getEmployeeById(pinCode).then( (data) => {
    await this.gesroomService.getEmployeeDetails(corporateId, site).then( (data, that = this) => {
      if(data){
        // for some reason we get back an array
          const _emp = JSON.parse(data.text())[0];
          that.emp = new Employee();
          Object.assign(that.emp, _emp);
          //that.emp = Object.setPrototypeOf(_emp, Employee);
      }

      loadingEmployee.dismiss();
    }, (reason) => {
      let alert = this.alertCtrl.create({
        title: 'Erreur',
        subTitle: "Une erreur est survenue : "+reason,
        buttons: ['retour']
      });
      alert.present();
    });
    if(!this.isEmployeeReady()){
      const errorEmp = this.loadingCtrl.create({
        spinner: 'hide',
        content: 'Impossible de trouver votre compte.',
      });
      errorEmp.present();
      setTimeout(() => {
        errorEmp.dismiss();
        loadingEmployee.dismiss();
      }, 2000);

    }
  }


  async confirmBooking() {
    if (this.adminService.isUserAuthorized(this.emp._corporateId)) {
      const loadingMeeting = this.loadingCtrl.create({
        spinner: 'dots',
        content: 'Réservation de votre réunion en cours...',
      });
      loadingMeeting.present();
      this.bookMeeting(this.start, this.end.subtract(1,"seconds"), this.emp, this.room).then( (data )=> {
        loadingMeeting.dismiss();
        const confirm = this.loadingCtrl.create({
          spinner: 'hide',
          content: 'Réservation effectuée.',
        });
        confirm.present();
        setTimeout(() => {
          confirm.dismiss();
          this.onCancelClicked();
        }, 3000);
      },(reason) => {
        loadingMeeting.dismiss();
        let alert = this.alertCtrl.create({
          title: 'Erreur',
          subTitle: "Une erreur est survenue : "+reason,
          buttons: ['retour']
        });
        alert.present();
        setTimeout(() => {
          alert.dismiss();
          this.onCancelClicked();
        }, 3000);
      }
    )

    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Non authorisé',
        subTitle: "Vous n'êtes pas authorisé à accèder à l'administration",
        buttons: ['retour']
      });
      alert.present();
    }
  }



  async bookMeeting(start: moment.Moment, end: moment.Moment, employee: Employee, room: Room) {
    const title:string = "Réservation depuis tablette";

    let meeting: Meeting = new Meeting(
      null,
      null,
      null,
      title,
      "",
      MeetingType.Meeting /*meetintype*/,
      MeetingStatus.NotStarted /* meeting status*/,
      start,
      end,
      employee,
      room,
      '');

    await this.gesroomService.postMeeting(meeting);
  }

  isEmployeeReady():boolean{
    if(!this.emp){
      return false;
    }
    else if(!this.emp._corporateId){
      return false;
    }
    return true;
  }

  onCancelClicked(){
    // dismiss modal

    this.viewCtrl.dismiss();
  }
}
