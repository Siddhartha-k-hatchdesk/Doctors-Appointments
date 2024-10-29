import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { retry } from 'rxjs';
import { UserServiceService } from '../../Services/User/user-service.service';
import { DoctorServiceService } from '../../Services/Doctor/doctor-service.service';


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
  constructor(private doctorservice:DoctorServiceService,private userService:UserServiceService, private fb: FormBuilder,private route:ActivatedRoute,private router:Router) {
    this.addDoctorForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      specialization: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.loadSpecializations();
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
    this.userService.getSpecializations().subscribe((data)=> {
      this.specializations = data;
    },
    (error)=>{
      console.error("error loading specialization",error);
    }
  );
  }
  loadDoctorData(id:number):void{
    this.doctorservice.getDoctorById(id).subscribe(doctor=>{
    
      this.addDoctorForm.patchValue({
        name:doctor.name,
        email:doctor.email,
        specialization: doctor.specializationId
      });
    });
  }

  onSubmit() {
    if (this.addDoctorForm.invalid) {
      alert('form is invalid');
      return;
    }
    const doctor = {
      name: this.addDoctorForm.value.name,
      email: this.addDoctorForm.value.email,
      specializationId: this.addDoctorForm.value.specialization  // Map specialization to specializationId
    };
      if(this.isEditMode && this.doctorId !==null){
        this.doctorservice.updateDoctor(this.doctorId,doctor).subscribe(response=>{
          alert('Doctor update successfully');
          this.router.navigate(['/admin-portal/doctor-list']);
        
        },error=>{
          alert('error updating doctor');
        });
      }else{

      this.doctorservice.addDoctor(doctor).subscribe({next:(response) => {
        alert('Doctor added successfully');
        this.router.navigate(['/admin-portal/doctor-list']);
        // Handle success
        this.addDoctorForm.reset();
      },
      error:(error) => {
        alert('Error adding doctor');
      }
        // Handle error
      });
    }
    } 
}
