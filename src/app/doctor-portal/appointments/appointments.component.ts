import { Component, OnInit } from '@angular/core';
import { BookServiceService } from '../../Services/Appointment/book-service.service';
import { BookingStatus } from '../../Enums/booking-status.enum';
import { UserServiceService } from '../../Services/User/user-service.service';
import { ActivatedRoute } from '@angular/router';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  currentPage: number = 1; // Current page number
  totalPages: number = 1; // Total number of pages
  pageSize: number = 10; // Number of appointments per page
  totalCount: number = 0; // Total number of appointments
  isLoading = false;
  searchQuery: string = ''; // Query for searching
  sortBy: string = 'preferreddate'; // Default sorting by preferreddate
  isAscending: boolean = true; // Ascending or Descending sorting
  
  private searchSubject: Subject<string> = new Subject<string>();

  constructor(private bookService:BookServiceService,private userService:UserServiceService,private route:ActivatedRoute,private sharedService:SharedDataServiceService){
     // Subscribe to loading state
     this.sharedService.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
// Debounce search input
this.searchSubject.pipe(
  debounceTime(300), // Wait for 300ms after the user stops typing
  distinctUntilChanged() // Only trigger search if the query changes
).subscribe(searchQuery => {
  this.searchQuery = searchQuery;
  this.currentPage = 1; // Reset to the first page on search
  this.loadAppointments(); // Reload appointments with the new search query
});
    
  }

  
ngOnInit(): void {
  this.doctorId = localStorage.getItem('doctorId');  // Retrieve doctorId from localStorage
  this.specialistId = localStorage.getItem('specialistId');  // Retrieve specialistId from localStorage

  console.log('Doctor ID:', this.doctorId);  // Debugging to confirm the ID is available
  console.log('Specialist ID:', this.specialistId);  // Debugging to confirm the ID is available

  this.loadAppointments(true);  // Load appointments for the logged-in doctor/specialist
}
loadAppointments(isInitialLoad: boolean = false): void {
  if (isInitialLoad) {
    this.sharedService.showLoading(); // Sirf page load hone par loading indicator show karein
  }

  const doctorIdString = localStorage.getItem('doctorId');
  const specialistIdString = localStorage.getItem('specialistId');

  const doctorId = doctorIdString ? Number(doctorIdString) : null;
  const specialistId = specialistIdString ? Number(specialistIdString) : null;
  console.log('Loading appointments with parameters:', {
    doctorId,
    specialistId,
    searchQuery: this.searchQuery,
    sortBy: this.sortBy,
    isAscending: this.isAscending,
    currentPage: this.currentPage,
    pageSize: this.pageSize,
  });
  if (doctorId || specialistId) {
    this.userService.getAppointments(
      doctorId,
      specialistId,
      this.searchQuery,
      this.sortBy,
      this.isAscending,
      this.currentPage,
      this.pageSize
    ).subscribe(
      data => {
        this.appointments = data.appointments;
        this.totalCount = data.paginationMetadata.totalCount;
        this.totalPages = data.paginationMetadata.totalPages;
        this.errorMessage = this.appointments.length === 0 ? 'No appointments found.' : null;
        if (isInitialLoad) {
          this.sharedService.hideLoading();
        }
      },
      error => {
        console.error('Error fetching appointments', error);
        this.errorMessage = 'No appointments available.';
        if (isInitialLoad) {
          this.sharedService.hideLoading();
        }
      }
    );
  } else {
    this.errorMessage = 'No doctor or specialist ID found.';
    this.appointments = [];
    this.sharedService.hideLoading();
  }
}

// Method to handle search input changes
onSearchChange(event: Event): void {
  const query = (event.target as HTMLInputElement).value;
  this.searchSubject.next(query); // Push the search input into the subject
}

onSortChange(sortField: string) {
  if (this.sortBy === sortField) {
    // Toggle sorting order
    this.isAscending = !this.isAscending;
  } else {
    // Change sorting field
    this.sortBy = sortField;
    this.isAscending = true; // Default to ascending when field changes
  }

  // Log the updated sorting parameters
  console.log('Sorting by:', this.sortBy, 'Ascending:', this.isAscending);

  // Reset to first page on sort change
  this.currentPage = 1;

  // Reload appointments with the new sorting parameters
  this.loadAppointments();
}



startAppointment(id: number) {
    console.log("Attempting to start appointment with ID:", id);
  //  this.sharedService.showLoading();
    this.bookService.updateStatus(id, BookingStatus.InProgress).subscribe(() => {
        // Ensure this is called with `id`
        this.loadAppointments(); // Reload appointments if necessary
       // this.sharedService.hideLoading();
      });
}

completeAppointment(id: number) {
    console.log("Completing appointment with ID:", id);
   // this,this.sharedService.showLoading();
    this.bookService.updateStatus(id, BookingStatus.Complete).subscribe(() => {
       // Reset `inProgressId` to `null`
        this.loadAppointments();
       // this.sharedService.hideLoading();
    }, error => {
        console.error("Error updating status", error);
      //  this.sharedService.hideLoading();
      });
}





 // Pagination Methods
 goToPage(page: number): void {
  if (page >= 1 && page <= this.totalPages) {
    this.currentPage = page;
    this.loadAppointments();
  }
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.loadAppointments();
  }
}

prevPage(): void {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.loadAppointments();
  }
}
onPageSizeChange(event: Event) {
  this.pageSize = +(event.target as HTMLSelectElement).value; // Get selected value
  this.currentPage = 1; // Reset to the first page
  this.loadAppointments(); // Reload data
}
}


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
  
// pickAppointment(appointmentId: number): void {
//   const doctorId = this.doctorId; // Ensure you have doctorId from local storage or auth service

//   if (!doctorId) {
//     console.error('No doctor ID found');
//     return;
//   }

//   // Call the BookService to pick the appointment
//   this.bookService.pickAppointment(appointmentId, doctorId).subscribe(
//     (response: any) => {
//       console.log('Appointment picked successfully', response);
//       // Find the specific appointment by ID and mark it as picked
//       const appointment = this.appointments.find(app => app.id === appointmentId);
//       if (appointment) {
//         appointment.picked = true;  // Add a new 'picked' property to hide the button
//       }
//     },
//     (error: any) => {
//       console.error('Error picking the appointment:', error);
//     }
//   );
// }
