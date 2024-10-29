import { Component, OnInit } from '@angular/core';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { BookingStatus } from '../Enums/booking-status.enum';
import { UserServiceService } from '../Services/User/user-service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css'
})
export class AppointmentsComponent implements OnInit{
  users: any;
  doctorId:any | null = null; 
  specialistId: any | null = null;
  appointments: any[] = [];
  errorMessage: string | null=null;
  
  constructor(private bookService:BookServiceService,private userService:UserServiceService,private route:ActivatedRoute){}

  // ngOnInit(): void {
  //   this.route.params.subscribe(params => {
  //     this.doctorId = +params['doctorId'] || null; // Read doctorId from route params
  //     this.specialistId = +params['specialistId'] || null; // Read specialistId from route params
  //     this.loadAppointments();
  //   });
  // }
  
// appointments.component.ts
// ngOnInit(): void {
//   // Fetch the logged-in doctor's ID and specialist ID from the UserService
//   this.doctorId = this.userService.getDoctorId(); // Get stored doctorId
//   this.specialistId = this.userService.getSpecialistId(); // Get stored specialistId

//   // Load the appointments automatically after fetching doctorId and specialistId
//   this.loadAppointments();
// }
ngOnInit(): void {
  this.doctorId = localStorage.getItem('doctorId');  // Retrieve doctorId from localStorage
  this.specialistId = localStorage.getItem('specialistId');  // Retrieve specialistId from localStorage

  console.log('Doctor ID:', this.doctorId);  // Debugging to confirm the ID is available
  console.log('Specialist ID:', this.specialistId);  // Debugging to confirm the ID is available

  this.loadAppointments();  // Load appointments for the logged-in doctor/specialist
}
  startAppointment(id: number) {
    this.bookService.updateStatus(id, BookingStatus.InProgress).subscribe(() => {
      this.loadAppointments(); // Refresh the list to reflect the status change
    },
    error => {
      console.error("Error updating status", error);
    });
  }
  
  completeAppointment(id: number) {
    this.bookService.updateStatus(id, BookingStatus.Complete).subscribe(() => {
      this.loadAppointments(); // Refresh the list to reflect the status change
    },error => {
      console.error("Error updating status", error);
    });
  }

loadAppointments(): void {
  // Get the stored values from localStorage
  const doctorIdString = localStorage.getItem('doctorId');
  const specialistIdString = localStorage.getItem('specialistId');

  console.log('Raw Doctor ID from localStorage:', doctorIdString);
  console.log('Raw Specialist ID from localStorage:', specialistIdString);

  // Parse the IDs, making sure we handle "null" or "undefined" as well
  const doctorId = doctorIdString && doctorIdString !== "null" && doctorIdString !== "undefined"
    ? Number(doctorIdString)
    : null;
  const specialistId = specialistIdString && specialistIdString !== "null" && specialistIdString !== "undefined"
    ? Number(specialistIdString)
    : null;

  console.log('Parsed Doctor ID:', doctorId);
  console.log('Parsed Specialist ID:', specialistId);

  // Check if either doctorId or specialistId is present
  if (doctorId || specialistId) {
    this.userService.getAppointments(this. doctorId, this.specialistId).subscribe(
      data => {
        this.appointments = data;
        this.errorMessage = this.appointments.length === 0 ? "No appointments found." : null;
      },
      error => {
        console.error('Error fetching appointments', error);
        this.errorMessage = "Error fetching appointments.";
      }
    );
  } else {
    this.errorMessage = "No doctor or specialist ID found.";
    this.appointments = [];
  }
}
pickAppointment(appointmentId: number): void {
  const doctorId = this.doctorId; // Ensure you have doctorId from local storage or auth service

  if (!doctorId) {
    console.error('No doctor ID found');
    return;
  }

  // Call the BookService to pick the appointment
  this.bookService.pickAppointment(appointmentId, doctorId).subscribe(
    (response: any) => {
      console.log('Appointment picked successfully', response);
      // Find the specific appointment by ID and mark it as picked
      const appointment = this.appointments.find(app => app.id === appointmentId);
      if (appointment) {
        appointment.picked = true;  // Add a new 'picked' property to hide the button
      }
    },
    (error: any) => {
      console.error('Error picking the appointment:', error);
    }
  );
}

}
  
