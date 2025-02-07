import { Component, OnInit } from '@angular/core';
import { BookServiceService } from '../../Services/Appointment/book-service.service';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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

  private searchSubject: Subject<string> = new Subject<string>();
  
  constructor(private bookservice: BookServiceService, private sharedService:SharedDataServiceService) {
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
      this.pageNumber = 1; // Reset to the first page on search
      this.GetAllAppointments(); // Reload appointments with the new search query
    });
  }

  ngOnInit(): void {
    this.GetAllAppointments(true); // Trigger initial load with show loading indicator
  }
  
  GetAllAppointments(isInitialLoad: boolean = false) {
    if (isInitialLoad) {
      this.sharedService.showLoading(); // Sirf page load hone par loading indicator show karein
    }
    
    this.bookservice
      .GetAllAppointments(this.pageNumber, this.pageSize, this.sortBy, this.isAscending, this.searchQuery)
      .subscribe(
        (data) => {
          this.appointments = data.appointments; // Sirf list update karein
          this.totalRecords = data.totalCount; // Total records update karein
          if (isInitialLoad) {
            this.sharedService.hideLoading();
          }
        },
        (error) => {
          console.error(error);
          if (isInitialLoad) {
            this.sharedService.hideLoading();
          }
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
  // Method to handle search input changes
  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query); // Push the search input into the subject
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
