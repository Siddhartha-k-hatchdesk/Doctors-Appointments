import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from '../../Services/User/user-service.service';
import { DoctorServiceService } from '../../Services/Doctor/doctor-service.service';
import { ToastrService } from 'ngx-toastr';


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
  constructor(private doctorservice:DoctorServiceService,private userService:UserServiceService, private fb: FormBuilder,private route:ActivatedRoute,private router:Router,private toastr:ToastrService) {
    this.addDoctorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      specialization: ['', Validators.required],
      location:['',Validators.required],
      experience:['',Validators.required],
      education:['',Validators.required],
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
    this.doctorservice.getDoctorById(id).subscribe(
      doctor => {
        console.log('Doctor fetched:', doctor);
        if (doctor) {
          const matchedSpecialization = this.specializations.find(
            spec => spec.specializationName === doctor.specialization
          );
          console.log('Matched Specialization:', matchedSpecialization);

          // Match location
        const matchingLoc = this.locations.find(
          loc => loc.locationName === doctor.location
        );
        console.log('Matched Location:', matchingLoc);
          // Patch the form with doctor data
          this.addDoctorForm.patchValue({
            name: doctor.name,
            email: doctor.email,
            specialization: matchedSpecialization ? matchedSpecialization.id : '',
            location: matchingLoc ? matchingLoc.id : '',
            experience:doctor.experience,
            education:doctor.education
            // Use ID if found
          });
        } else {
          console.error('Doctor not found!');
        }
      },
      error => {
        console.error('Error loading doctor data', error);
      }
    );
  }
 

  onSubmit() {
    if (this.addDoctorForm.invalid) {
      // alert('Please fill all required fields correctly.');
      this.addDoctorForm.markAllAsTouched(); // Highlights all invalid fields
      return;
    }
    const doctor = {
      name: this.addDoctorForm.value.name,
      email: this.addDoctorForm.value.email,
      specializationId: this.addDoctorForm.value.specialization,
      locationId:this.addDoctorForm.value.location,
      experience:this.addDoctorForm.value.experience,
      education:this.addDoctorForm.value.education  // Map specialization to specializationId
    };
      if(this.isEditMode && this.doctorId !==null){
        this.doctorservice.updateDoctor(this.doctorId,doctor).subscribe(response=>{
          this.toastr.success('Doctor update successfully');
          this.router.navigate(['/admin-portal/doctor-list']);
        
        },error=>{
          this.toastr.warning('error updating doctor');
        });
      }else{

      this.doctorservice.addDoctor(doctor).subscribe({next:(response) => {
        this.toastr.success('Doctor added successfully');
        this.router.navigate(['/admin-portal/doctor-list']);
        // Handle success
        this.addDoctorForm.reset();
      },
      error:(error) => {
        this.toastr.warning('Error adding doctor');
      }
        // Handle error
      });
    }
    } 
}
