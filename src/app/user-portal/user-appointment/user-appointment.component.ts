import { Component, OnInit } from '@angular/core';
import { BookServiceService } from '../../Services/Appointment/book-service.service';
import { MatDialog } from '@angular/material/dialog';
import { BookAppointmentComponent } from '../../book-appointment/book-appointment.component';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-appointment',
  templateUrl: './user-appointment.component.html',
  styleUrl: './user-appointment.component.css'
})
export class UserAppointmentComponent implements OnInit {
  users:any;

  constructor(private bookservice:BookServiceService, public dialog:MatDialog,private authservice:AuthService){}

  openAppointmentDialog(): void {
      //  const loggedInUserId= this.authservice.getUserId();

    const dialogRef = this.dialog.open(BookAppointmentComponent, {
      width: '600px',
      height: 'auto',
  
    });

    // After dialog is closed, check if booking was successful and refresh the list
    dialogRef.afterClosed().subscribe(result => {
      if (result) { // Check if we received a booking response
        console.log('New booking added:', result);
        this.addNewBooking(result); // Add the new booking to the list
      }
    });
  }
  ngOnInit(): void {
    this.loadUserAppointments();  // Fetch appointments when the component initializes
  }

  // Method to load appointments for the logged-in user
  loadUserAppointments(): void {
    this.bookservice.getAppointmentsForUser().subscribe(
      (response: any) => {
        this.users = response;  // Assign the fetched appointments to the 'users' array
        console.log('User appointments:', this.users);
      },
      (error: any) => {
        console.error('Error fetching appointments:', error);
      }
    );
  }
   // Method to add the new booking to the existing list
   addNewBooking(newBooking: any): void {
    this.users.push(newBooking); // Add the new booking to the list
    console.log('Updated user appointments:', this.users);
  }
}
  
