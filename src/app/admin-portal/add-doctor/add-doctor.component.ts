import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from '../../Services/User/user-service.service';
import { DoctorServiceService } from '../../Services/Doctor/doctor-service.service';
import { ToastrService } from 'ngx-toastr';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';


@Component({
  selector: 'app-add-doctor',
  templateUrl: './add-doctor.component.html',
  styleUrls: ['./add-doctor.component.css']
})
export class AddDoctorComponent {
addDoctorForm: FormGroup;
isEditMode: boolean = false; 
doctorId: number | null = null;
specializations: any[] = [];
  locations: any[]=[];
  isLoading = false;
  

  constructor(private sharedservice:SharedDataServiceService, private doctorservice:DoctorServiceService,private userService:UserServiceService, private fb: FormBuilder,private route:ActivatedRoute,private router:Router,private toastr:ToastrService) {
    this.addDoctorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      specialization: ['', Validators.required],
      location:['',Validators.required],
      experience:[''],
      education:[''],
    });
     // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
  ngOnInit(): void {
    this.loadSpecializations();
    this.loadLocations();
    // Check if we are in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.doctorId = +id; // Convert string to number
        this.loadDoctorData(this.doctorId);
      }
    });
  }
  loadSpecializations(): void {
    this.userService.getSpecializations().subscribe(data => {
      this.specializations = data;
      console.log('Specializations loaded:', this.specializations);
  
      if (this.isEditMode && this.doctorId !== null) {
        this.loadDoctorData(this.doctorId);
      }
    });
  }
  loadLocations(): void {
    this.doctorservice.getLocations().subscribe((data: any) => {
      this.locations = data;
      console.log('location loaded',this.locations);
      // console.log('Locations:', this.locations);
      if (this.isEditMode && this.doctorId !== null) {
        this.loadDoctorData(this.doctorId);
      }
    });
  }
  loadDoctorData(id: number): void {
    this.sharedservice.showLoading();
    this.doctorservice.getDoctorById(id).subscribe(
      doctor => {
        this.sharedservice.hideLoading();
        if (doctor) {
          const matchedSpecialization = this.specializations.find(
            spec => spec.specializationName === doctor.specialization
          );
          const matchingLoc = this.locations.find(
            loc => loc.locationName === doctor.location
          );
          this.addDoctorForm.patchValue({
            name: doctor.name,
            email: doctor.email,
            specialization: matchedSpecialization ? matchedSpecialization.id : '',
            location: matchingLoc ? matchingLoc.id : '',
            experience: doctor.experience,
            education: doctor.education
          });
        } else {
          console.error('Doctor not found!');
        }
      },
      error => {
        this.sharedservice.hideLoading();
        console.error('Error loading doctor data', error);
      }
    );
  }
  enforceMaxLength(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
  
    // Check if the value's length exceeds 1
    if (inputElement.value.length > 4) {
      inputElement.value = inputElement.value.slice(0, 1); // Keep only the first character
    }
  }
  

  onSubmit() {
    if (this.addDoctorForm.invalid) {
      this.addDoctorForm.markAllAsTouched();
      return;
    }
    const doctorName = this.addDoctorForm.value.name;
    const prefixedName = doctorName && !doctorName.startsWith('Dr.') ? 'Dr. ' + doctorName : doctorName;
    const doctor = {
      name: prefixedName,
      email: this.addDoctorForm.value.email,
      specializationId: this.addDoctorForm.value.specialization,
      locationId: this.addDoctorForm.value.location,
      experience: this.addDoctorForm.value.experience === '' ? null : this.addDoctorForm.value.experience,
      education: this.addDoctorForm.value.education
    };
  
    this.sharedservice.showLoading();
    if (this.isEditMode && this.doctorId !== null) {
      this.doctorservice.updateDoctor(this.doctorId, doctor).subscribe({
        next: () => {
          this.sharedservice.hideLoading();
          this.toastr.success('Doctor updated successfully');
          this.router.navigate(['/admin-portal/doctor-list']);
        },
        error: () => {
          this.sharedservice.hideLoading();
          this.toastr.warning('Error updating doctor');
        }
      });
    } else {
      this.doctorservice.addDoctor(doctor).subscribe({
        next: () => {
          this.sharedservice.hideLoading();
          this.toastr.success('Doctor added successfully');
          this.router.navigate(['/admin-portal/doctor-list']);
          this.addDoctorForm.reset();
        },
        error: (error) => {
          this.sharedservice.hideLoading();
          if (error.status === 409) {
            this.addDoctorForm.get('email')?.setErrors({ emailExists: true });
          }
          this.toastr.warning('Error adding doctor');
        }
      });
    }
  }
  
}
