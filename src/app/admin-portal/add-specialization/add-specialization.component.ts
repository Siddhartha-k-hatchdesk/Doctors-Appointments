import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../Services/User/user-service.service';
import { DoctorServiceService } from '../../Services/Doctor/doctor-service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';
declare var $:any;
@Component({
  selector: 'app-add-specialization',
  templateUrl: './add-specialization.component.html',
  styleUrl: './add-specialization.component.css'
})
export class AddSpecializationComponent implements OnInit,AfterViewInit {
  specializations: any[]=[];
  isModalOpen: boolean = false;
  newSpecialization = { specializationName: '', image: null };
  editingId:number|null=null;
  totalSpecializations: number = 0;
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  isLoading = false;
  searchQuery: string = ''; // Add search query variable

  constructor(private router:Router,private doctorservice:DoctorServiceService, 
    private userservice:UserServiceService,private toastr:ToastrService,private sharedservice:SharedDataServiceService){
       // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
    
  }
  ngOnInit(): void {
    this.loadSpecializations();
  }
  ngAfterViewInit(): void {
    // Initialize Bootstrap tooltips after view has been initialized
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }
  loadSpecializations(): void {
    this.sharedservice.showLoading();
    this.doctorservice
      .getSpecializations(this.currentPage, this.pageSize, this.searchQuery) // Pass searchQuery here
      .subscribe((data: any) => {
        this.specializations = data.data;
        this.totalSpecializations = data.totalRecords;
        this.totalPages = data.totalPages;
        this.sharedservice.hideLoading();
      });
  }
   // Method to handle search input changes
   onSearchChange(): void {
    this.currentPage = 1; // Reset to the first page when search query changes
    this.loadSpecializations(); // Reload specializations
  }
  clearSearch(): void {
    this.searchQuery = '';
    this.loadSpecializations(); // Reload without search filter
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadSpecializations();
  }
  onPageSizeChange(event: Event) {
    this.pageSize = +(event.target as HTMLSelectElement).value; // Get selected value
    this.currentPage = 1; // Reset to the first page
    this.loadSpecializations(); // Reload data
  }
  openModal(specialization?: any): void {
    this.isModalOpen = true;
  
    if (specialization) {
      // Editing mode
      this.editingId = specialization.id;
      this.newSpecialization.specializationName = specialization.specializationName;
      this.newSpecialization.image = specialization.imagePath; // Ensure correct path or file is set
      console.log('Editing Specialization:', this.newSpecialization);
    } else {
      // Adding mode
      this.editingId = null;
      this.newSpecialization = { specializationName: '', image: null };
    }
  }
  
  closeModal(): void {
    this.isModalOpen = false;
    this.newSpecialization = { specializationName: '', image: null };
    this.editingId = null;
  }
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newSpecialization.image = file; // Save the file in `newSpecialization.image`
    }
  }
  isImageFile(image: any): boolean {
    return image instanceof File;
  }
  getImageUrl(image: any): string {
    return this.isImageFile(image) ? URL.createObjectURL(image) : image;
  }
  
  addSpecialization(): void {
    if (this.newSpecialization.specializationName.trim()) {
      this.sharedservice.showLoading(); // Show loading spinner before the request
  
      const formData = new FormData();
      formData.append('specializationName', this.newSpecialization.specializationName);
  
      if (this.newSpecialization.image) {
        console.log("Image selected for upload:", this.newSpecialization.image); // Log image data
        formData.append('image', this.newSpecialization.image);
      }
  
      if (this.editingId) {
        // Update specialization
        console.log("Sending request to update specialization with ID:", this.editingId);
        this.doctorservice.updateSpecialization(this.editingId, formData).subscribe(
          (response: any) => {
            this.sharedservice.hideLoading(); // Hide loading spinner after the request
            this.toastr.success('Specialization updated successfully!');
            this.loadSpecializations(); // Update table
            this.closeModal(); // Close modal
          },
          (error: any) => {
            this.sharedservice.hideLoading(); // Hide loading spinner on error
            this.toastr.error('Error updating specialization.');
            console.error('Error updating specialization:', error);
          }
        );
      } else {
        // Add specialization
        this.doctorservice.addSpecialization(formData).subscribe(
          (response: any) => {
            this.sharedservice.hideLoading(); // Hide loading spinner after the request
            this.toastr.success('Specialization added successfully!');
            this.loadSpecializations(); // Update table
            this.closeModal(); // Close modal
          },
          (error: any) => {
            this.sharedservice.hideLoading(); // Hide loading spinner on error
            console.error('Error adding specialization:', error);
  
            // Check if the error is related to duplicate specialization
            if (error.status === 400 && error.error) {
              this.toastr.warning(`Error: ${error.error}`); // Show backend validation error
            } else {
              this.toastr.error('Failed to add specialization. Please try again.');
            }
          }
        );
      }
    } else {
      this.toastr.warning('Specialization name cannot be empty!');
    }
  }
  
  
  
  
  deletespecialization(id: number): void {
    if (confirm('Are you sure you want to delete this specialization?')) {
      this.sharedservice.showLoading(); // Show loading spinner before the request
      
      this.doctorservice.deleteSpecialization(id).subscribe(
        response => {
          this.sharedservice.hideLoading(); // Hide loading spinner after the request
          this.toastr.success('Specialization deleted successfully');
          this.loadSpecializations(); // Reload the list to reflect changes
        },
        error => {
          this.sharedservice.hideLoading(); // Hide loading spinner on error
          this.toastr.warning('Error deleting specialization');
        }
      );
    }
  }
  
  // editDoctor(id: number): void {
  //   this.router.navigate(['/admin-portal/add-doctor', id]);
  // }
}
