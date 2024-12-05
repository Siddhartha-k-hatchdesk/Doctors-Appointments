import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../Services/User/user-service.service';
import { ActivatedRoute } from '@angular/router';
import { DoctorServiceService } from '../../Services/Doctor/doctor-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doctorprofile',
  templateUrl: './doctorprofile.component.html',
  styleUrl: './doctorprofile.component.css'
})
export class DoctorprofileComponent implements OnInit {
  specializations: any[]=[];
  locations: any[] = [];
  formData = { 
    name: '',
    email: '',
    specialization: '',
    location: '',
    education:'',
    experience:'',
  };
  constructor(private userService:UserServiceService,private route:ActivatedRoute,
    private doctorService:DoctorServiceService,private toastr:ToastrService){}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.doctorService.getDoctorsById(+doctorId).subscribe((data: any) => {
        this.formData = {
          name: data.name,
          email: data.email,
          education:data.education,
          experience:data.experience,
          specialization: data.specialization,
          location: data.location
        };
        // console.log('Doctor Data:', this.formData);
        this.loadSpecializations();
        this.loadLocations();
      });
    }else {
      // Fallback in case doctorId is missing
      this.loadSpecializations();
      this.loadLocations();
    }
  }
   
  
  loadSpecializations(): void {
    this.userService.getSpecializations().subscribe((data: any) => {
      this.specializations = data;
      // console.log('Specializations:', this.specializations);
  
      // Match the specialization name with dropdown options
      const matchingSpec = this.specializations.find(
        spec => spec.specializationName === this.formData.specialization
      );
  
      if (matchingSpec) {
        this.formData.specialization = matchingSpec.id; // Assign ID to formData
      }
      // console.log('Updated Form Specialization:', this.formData.specialization);
    });
  }
  
  loadLocations(): void {
    this.doctorService.getLocations().subscribe((data: any) => {
      this.locations = data;
      // console.log('Locations:', this.locations);
  
      // Match the location name with dropdown options
      const matchingLoc = this.locations.find(
        loc => loc.locationName === this.formData.location
      );
  
      if (matchingLoc) {
        this.formData.location = matchingLoc.id; // Assign ID to formData
      }
      // console.log('Updated Form Location:', this.formData.location);
    });
  }
  onSubmit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id'); // Get doctor ID
    if (doctorId) {
      const updatedData = {
        name: this.formData.name,
        email: this.formData.email,
        education:this.formData.education,
        experience:this.formData.experience,
        specializationId: this.formData.specialization,
        locationId: this.formData.location
      };
  
      this.doctorService.updatedoctorprofile(+doctorId, updatedData).subscribe(
        response => {
          // console.log('Doctor updated successfully:', response);
          this.toastr.success('Doctor details updated successfully!');
        },
        error => {
          // console.error('Error updating doctor:', error);
          this.toastr.error('Failed to update doctor details. Please try again.');
        }
      );
    } else {
      this.toastr.error('Invalid doctor ID.');
    }
  }
  
}
