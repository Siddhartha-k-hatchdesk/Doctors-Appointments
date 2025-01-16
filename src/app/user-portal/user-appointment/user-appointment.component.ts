import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { BookServiceService } from '../../Services/Appointment/book-service.service';
import { MatDialog } from '@angular/material/dialog';
import { BookAppointmentComponent } from '../../book-appointment/book-appointment.component';
import { AuthService } from '../../auth.service';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-appointment',
  templateUrl: './user-appointment.component.html',
  styleUrl: './user-appointment.component.css'
})
export class UserAppointmentComponent implements OnInit {
  users:any=[];
  inProgressId:number|null=null;
  isLoading = false;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;

  constructor(private zone:NgZone, 
    private cdr:ChangeDetectorRef, private sharedservice:SharedDataServiceService, private bookservice:BookServiceService,
     public dialog:MatDialog,private authservice:AuthService,private toastr:ToastrService)
     {
       // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
     }

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
    console.log('Initializing component...');
    this.loadUserAppointments();
}

   // Method to load appointments for the logged-in user
  loadUserAppointments(): void {
    this.sharedservice.showLoading();
    this.bookservice.getAppointmentsForUser(this.currentPage, this.pageSize).subscribe(
        (response: any) => {
            console.log('API Response:', response); // Log full response
            this.users = response?.appointments || []; // Assign appointments array
            this.totalPages = response?.totalPages || 1; // Assign total pages
           // console.log('Assigned Users:', this.users); // Log assigned users
            this.sharedservice.hideLoading();
        },
        (error: any) => {
            console.error('Error fetching appointments:', error);
            this.sharedservice.hideLoading();
        }
    );
}


  changePage(action: string): void {
    if (action === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (action === 'next' && this.currentPage < this.totalPages) {
      this.currentPage++;
    }
    this.loadUserAppointments();
  }
  onPageSizeChange(event: Event) {
    this.pageSize = +(event.target as HTMLSelectElement).value; // Get selected value
    this.currentPage = 1; // Reset to the first page
    this.loadUserAppointments(); // Reload data
  }
 // Method to add the new booking to the existing list
   addNewBooking(newBooking: any): void {
    this.users.push(newBooking);
    // Add the new booking to the list
    console.log('Updated user appointments:', this.users);
  }
  removeAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.sharedservice.showLoading();
      this.inProgressId = appointmentId; // Disable button while in progress
      this.bookservice.deleteAppointment(appointmentId).subscribe({
        next: () => {
          // Remove the appointment from the list after deletion
          this.users = this.users.filter((user: any) => user.id !== appointmentId);
          this.inProgressId = null; // Enable button after completion
          this.toastr.success('Appointment deleted successfully.');
          this.sharedservice.hideLoading();
        },
        error: (error) => {
          console.error('Error while deleting appointment:', error);
          this.inProgressId = null; // Re-enable button on error
          this.toastr.error('Failed to delete appointment.');
          this.sharedservice.hideLoading();
        }
      });
    }
  }
  
}
  
 // const currentId = this.sharedservice.getCurrentInProgress();
  // if (currentId !== null) {
  //     console.log("Manually emitting current value in UserAppointmentComponent:", currentId);
  //     this.sharedservice.updateInProgress(currentId);
  // }


   //   this.sharedservice.inProgress$.subscribe(id => {
  //     this.zone.run(() => {
  //         console.log("Received InProgress ID (inside NgZone):", id);
  //         this.inProgressId = id;
  //         this.cdr.detectChanges(); // Update UI
  //     });
  // });


 
  // Emit the current value manually
  // const currentId = this.sharedservice.getCurrentInProgress();
  // console.log("Manually emitting current value in UserAppointmentComponent:", currentId);
  // if (currentId !== null) {
  //     this.sharedservice.updateInProgress(currentId);
  // }

