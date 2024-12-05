import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { DoctorServiceService } from '../Services/Doctor/doctor-service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var $:any;
@Component({
  selector: 'app-add-specialization',
  templateUrl: './add-specialization.component.html',
  styleUrl: './add-specialization.component.css'
})
export class AddSpecializationComponent implements OnInit,AfterViewInit {
  specializations: any[]=[];
  isModalOpen: boolean = false;
  newSpecialization = { specializationName: '' };
   editingId:number|null=null;
  constructor(private router:Router,private doctorservice:DoctorServiceService, private userservice:UserServiceService,private toastr:ToastrService){
    
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
    this.userservice.getSpecializations().subscribe((data: any)=> {
      this.specializations = data;
    }
  );
  
  }
  openModal(specialization?: any): void {
    this.isModalOpen = true;

    if (specialization) {
      // Editing mode
      this.editingId = specialization.id;
      this.newSpecialization.specializationName = specialization.specializationName;
    } else {
      // Adding mode
      this.editingId = null;
      this.newSpecialization = { specializationName: '' };
    }
  }
  closeModal(): void {
    this.isModalOpen = false;
    this.newSpecialization = { specializationName: '' };
    this.editingId = null;
  }
  addSpecialization(): void {
    if (this.newSpecialization.specializationName.trim()) {
      if (this.editingId) {
        // Update specialization
        this.doctorservice
          .updateSpecialization(this.editingId, this.newSpecialization)
          .subscribe(
            (response: any) => {
              this.toastr.success('Specialization updated successfully!');
              console.log('Updated Specialization Response:', response);
              this.loadSpecializations(); // Update table
              this.closeModal(); // Close modal
            },
            (error: any) => {
              this.toastr.error('Error updating specialization.');
              console.error('Error updating specialization:', error);
            }
          );
      } else {
        // Add specialization
        this.doctorservice.addSpecialization(this.newSpecialization).subscribe(
          (response: any) => {
            this.toastr.success('Specialization added successfully!');
            this.loadSpecializations(); // Update table
            this.closeModal(); // Close modal
          },
          (error: any) => {
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
    }
    else{
      this.toastr.warning('Specialization name cannot be empty!');
    }
  }
  deletespecialization(id: number): void {
    if (
      confirm('Are you sure you want to delete this specialization?')) {
      this.doctorservice.deleteSpecialization(id).subscribe(response => {
        this.toastr.success('specialization deleted successfully');
        this.loadSpecializations(); // Reload the list to reflect changes
      }, error => {
        this.toastr.warning('Error deleting specialization');
      });
    }
  }
  // editDoctor(id: number): void {
  //   this.router.navigate(['/admin-portal/add-doctor', id]);
  // }
}
