import { Component, OnInit } from '@angular/core';
import { BookServiceService } from '../../Services/Appointment/book-service.service';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-allappointments',
  templateUrl: './allappointments.component.html',
  styleUrls: ['./allappointments.component.css']
})
export class AllappointmentsComponent implements OnInit {
  appointments: any[] = []; // Initialize as array
  errorMessage: string | null = null;
  totalRecords: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  sortBy: string = 'Id'; // Default sorting field
  isAscending: boolean = false; // Default sorting order (descending)
  searchQuery: string = ''; // Default search query

  Math = Math; 
  isLoading=false;

  constructor(private bookservice: BookServiceService, private sharedService:SharedDataServiceService) {
     // Subscribe to loading state
     this.sharedService.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    this.GetAllAppointments();
  }

  GetAllAppointments() {
    this.sharedService.showLoading();
    this.bookservice
      .GetAllAppointments(this.pageNumber, this.pageSize, this.sortBy, this.isAscending, this.searchQuery)
      .subscribe(
        (data) => {
          console.log('appointments', data); // Verify structure
          this.totalRecords = data.totalCount; // Assign metadata
          this.appointments = data.appointments; // Assign actual data array
          this.sharedService.hideLoading();
        },
        (error) => {
          this.errorMessage = 'Error fetching appointments. Please try again later.';
          this.sharedService.hideLoading();
          console.error(error);
        }
      );
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
    this.GetAllAppointments(); // Fetch sorted data
  }
  onSearchChange(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.pageNumber = 1; // Reset to first page
    this.GetAllAppointments(); // Fetch filtered data
  }
    

  onPageChange(newPage: number) {
    this.pageNumber = newPage;
    this.GetAllAppointments();
  }
  onPageSizeChange(event: Event) {
    this.pageSize = +(event.target as HTMLSelectElement).value; // Get selected value
    this.pageNumber = 1; // Reset to the first page
    this.GetAllAppointments(); // Reload data
  }
}
