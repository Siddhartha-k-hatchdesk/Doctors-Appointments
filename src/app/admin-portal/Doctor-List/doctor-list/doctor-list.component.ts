import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../../Services/User/user-service.service';
import { DoctorServiceService } from '../../../Services/Doctor/doctor-service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataServiceService } from '../../../Services/sevices/shared-data-service.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
declare  var $:any;

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit,AfterViewInit {

  doctors:any[]=[];
  selectedDoctor:any=null;
  totalDoctors: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  isLoading = false;
  searchQuery: string = ''; // For searching
  sortBy: string = '';      // Field to sort by
  isAscending: boolean = true; // Sorting order

  private searchSubject: Subject<string> = new Subject<string>();
  
  constructor(private sharedservice:SharedDataServiceService, private userService:UserServiceService,private doctorService:DoctorServiceService,private router:Router,private toastr:ToastrService){

    // Subscribe to loading state
    this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
     // Debounce search input
     this.searchSubject.pipe(
      debounceTime(300), // Wait for 300ms after the user stops typing
      distinctUntilChanged() // Only trigger search if the query changes
    ).subscribe(searchQuery => {
      this.searchQuery = searchQuery;
      this.currentPage = 1; // Reset to the first page on search
      this.loadDoctors();
    });
  }

  ngOnInit(): void {
this.loadDoctors();

  }
  ngAfterViewInit(): void {
    // Initialize Bootstrap tooltips after view has been initialized
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }
    loadDoctors(): void {
    this.sharedservice.showLoading();
    this.doctorService
      .getDoctors(this.currentPage, this.pageSize, this.sortBy, this.isAscending, this.searchQuery)
      .subscribe((data) => {
        this.doctors = data.data;
        this.totalDoctors = data.totalRecords;
        this.totalPages = data.totalPages;
        this.sharedservice.hideLoading();
      });
  }
  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchSubject.next(query); // Push the search input into the subject
  }

  onSortChange(sortField: string): void {
    if (this.sortBy === sortField) {
      this.isAscending = !this.isAscending; // Toggle sorting order
    } else {
      this.sortBy = sortField; // Set new sorting field
      this.isAscending = true; // Default to ascending for new field
    }
    this.loadDoctors();
  }


  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return; // Prevent invalid pages
    this.currentPage = page;
    this.loadDoctors();
  }
  onPageSizeChange(event: Event) {
    this.pageSize = +(event.target as HTMLSelectElement).value; // Get selected value
    this.currentPage = 1; // Reset to the first page
    this.loadDoctors(); // Reload data
  }
  deleteDoctor(id: number): void {
    if (confirm('Are you sure you want to delete this doctor?')) {
      this.sharedservice.showLoading();
      this.doctorService.deleteDoctor(id).subscribe({
        
        next: (response) => {
          console.log('Success response:', response); // Debug success response
          
          this.toastr.success(response.message || 'Doctor deleted successfully');
          this.loadDoctors(); // Reload the list after deletion
        },
        error: (err) => {
          console.error('Error response:', err); // Debug error response
          if (err.status === 404) {
            this.toastr.warning('Doctor not found');
          } else {
            this.toastr.error(err.message || 'Error deleting doctor');
          }
        },
        complete: () => {
          // Hide loading indicator once the request is complete
          this.sharedservice.hideLoading();
        }
      });
    }
  }
  
  
  editDoctor(id: number): void {
    this.router.navigate(['/admin-portal/add-doctor', id]);
  }
}

