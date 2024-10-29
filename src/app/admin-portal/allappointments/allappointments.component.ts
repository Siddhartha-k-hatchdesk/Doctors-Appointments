import { Component, OnInit } from '@angular/core';
import { BookServiceService } from '../../Services/Appointment/book-service.service';

@Component({
  selector: 'app-allappointments',
  templateUrl: './allappointments.component.html',
  styleUrl: './allappointments.component.css'
})
export class AllappointmentsComponent implements OnInit {
  appointments: any;
  errorMessage: any;

  constructor(private bookservice:BookServiceService){}
  ngOnInit(): void {
    this.GetAllAppointments();
  }

  GetAllAppointments() {
    this.bookservice.GetAllAppointmemts().subscribe(
      (data) => {
        console.log('appointments', data);
        this.appointments = data;
      },
      (error) => {
        this.errorMessage = 'Error fetching appointments. Please try again later.';
        console.error(error);
      }
    );
  }

}
