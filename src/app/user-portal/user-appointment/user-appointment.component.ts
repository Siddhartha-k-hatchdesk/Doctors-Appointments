import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookServiceService } from '../../Services/Appointment/book-service.service';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { UserServiceService } from '../../Services/User/user-service.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-appointment',
  templateUrl: './user-appointment.component.html',
  styleUrls: ['./user-appointment.component.css']
})
export class UserAppointmentComponent implements OnInit {
  users: any[] = [];
  inProgressId: number | null = null;
  isLoading = false;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  selectedDoctorId: number | null = null;
  countdownIntervals: { [key: number]: any } = {};
  sortBy: string = 'Id'; // Default sorting field
  isAscending: boolean = false; // Default sorting order (descending)
  searchQuery: string = ''; // Default search query
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchText: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private sharedservice: SharedDataServiceService,
    private bookservice: BookServiceService,
    private toastr: ToastrService,
    private userservice: UserServiceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Subscribe to loading state
    this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['doctorId']) {
        this.selectedDoctorId = params['doctorId']; // Set selected doctor
      }
    });
    console.log('Initializing component...');
    this.loadUserAppointments(true);
  }

  convertSecondsToTimeFormat(seconds: number): string {
    if (!seconds || seconds <= 0 || isNaN(seconds)) return '00:00'; // Prevent NaN errors

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${secs < 10 ? '0' + secs : secs}`;
  }

  startCountdown(appointment: any) {
    const appointmentId = appointment.Id;

    if (this.countdownIntervals[appointmentId]) {
      clearInterval(this.countdownIntervals[appointmentId]);
    }

    this.countdownIntervals[appointmentId] = setInterval(() => {
      if (appointment.CanEditTimeLeft > 0) {
        appointment.CanEditTimeLeft--;
        this.updateAppointment(appointment); // Update appointment live

        this.cdr.detectChanges(); // Trigger change detection after each countdown tick
      } else {
        clearInterval(this.countdownIntervals[appointmentId]);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    // Clear all countdown intervals when component is destroyed
    Object.values(this.countdownIntervals).forEach(interval => clearInterval(interval));
  }

  // Method to load appointments for the logged-in user
  loadUserAppointments(isInitialLoad: boolean = false): void {
    if (isInitialLoad) {
      this.sharedservice.showLoading(); // Sirf page load hone par loading indicator show karein
    }
    
    this.bookservice.getAppointmentsForUser(this.currentPage, this.pageSize, this.sortBy, this.isAscending, this.searchQuery).subscribe(
      (response: any) => {
        this.users = response?.data || [];
        this.totalPages = Math.ceil(response?.totalCount / this.pageSize) || 1;
  
        // Start countdown for each appointment immediately after the data is fetched
        this.users.forEach((appointment: any) => {
          if (appointment.canEditTimeLeft > 0) {
            this.startCountdown(appointment);
          }
        });
  
        if (isInitialLoad) {
          this.sharedservice.hideLoading();
        }
      },
      (error: any) => {
        console.error('Error fetching appointments:', error);
        if (isInitialLoad) {
          this.sharedservice.hideLoading();
        }
      }
    );
  }
  changeSorting(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortAppointments();
  }
  
  sortAppointments(): void {
    this.users.sort((a: any, b: any) => {
      let valueA = a[this.sortColumn];
      let valueB = b[this.sortColumn];
  
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
  
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  searchAppointments(): void {
    if (this.searchText.trim() === '') {
      this.loadUserAppointments(); // Agar empty hai, toh sare data ko wapas load karna hai
      return;
    }
  
    const searchLower = this.searchText.toLowerCase();
    this.users = this.users.filter((appointment: any) => 
      appointment.doctorName.toLowerCase().includes(searchLower) ||
      appointment.preferreddate.includes(searchLower) ||
      appointment.preferredtime.includes(searchLower) ||
      appointment.statusName.toLowerCase().includes(searchLower)
    );
  }
  editAppointment(appointmentId: number): void {
    if (!appointmentId) {
      console.warn('Invalid appointment ID');
      return;
    }
  
    this.userservice.getappointmentdetailsbyId(appointmentId).subscribe(
      (response) => {
        if (response) {
          console.log('Fetched appointment details:', response);
  
          // Store appointment details for editing
          this.sharedservice.setAppointmentData(response);
          this.sharedservice.setDoctorId(response.doctorId?.toString() || '');
          this.sharedservice.setSpecialistId(response.specialistId?.toString() || '');

          this.sharedservice.setAppointmentId(appointmentId);
          // Navigate to the form with prefilled data
          this.router.navigate(['/searchdoctor'], { queryParams: { edit: true, appointmentId } });
        } else {
          console.warn('No appointment details found');
        }
      },
      (error) => {
        console.error('Error fetching appointment details:', error);
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

    // If the new booking has a countdown, start it
    if (newBooking.CanEditTimeLeft > 0) {
      this.startCountdown(newBooking);
    }
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

  onbuttonclick() {
    this.sharedservice.setAppointmentId(null); 
    this.router.navigate(['/searchdoctor']);
  }

  // Helper method to ensure the appointment is updated in the array
  updateAppointment(updatedAppointment: any) {
    const index = this.users.findIndex((app: any) => app.Id === updatedAppointment.Id);
    if (index !== -1) {
      this.users[index] = updatedAppointment; // Update the appointment in the array
    }
  }
}
