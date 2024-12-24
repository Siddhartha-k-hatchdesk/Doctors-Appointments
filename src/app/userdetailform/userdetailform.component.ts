import { Component, Input, OnInit } from '@angular/core';
import { RegisterServiceService } from '../Services/Register/register-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CdkStepper } from '@angular/cdk/stepper';



@Component({
  selector: 'app-userdetailform',
  templateUrl: './userdetailform.component.html',
  styleUrl: './userdetailform.component.css'
})
export class UserdetailformComponent implements OnInit {
  @Input() stepper!: CdkStepper;
  
  register : FormGroup;
  isFormSubmitted:boolean=false;
  errorMessage: string='';
  isLoggedIn:boolean=false;
  userDetails:any;

  constructor(private router:Router, private sharedservice:SharedDataServiceService,private registerService:RegisterServiceService,private toastr:ToastrService){

    this.register = new FormGroup({
      name : new FormControl("",[Validators.required]),
      email : new FormControl("",[Validators.required,Validators.email]),
      gender:new FormControl("Male"),
      dateOfBirth: new FormControl(""),
      phoneNumber: new FormControl("",[ 
        Validators.required,
        Validators.pattern("^[0-9]{10}$")
      ]),
      password:new FormControl("",[
        Validators.required,
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$") 
      ])
    })
  }
  ngOnInit(): void {
    this.fetchUserDetails();
  }
  fetchUserDetails() {
    this.sharedservice.loggedinUser().subscribe({
      next: (response: any) => {
        this.isLoggedIn = true; // User is logged in
        this.userDetails = {
          name: response.name,
          email: response.email,
          gender: response.gender,
          dateOfBirth: response.dateOfBirth,
          phoneNumber: response.phone
        };
      },
      error: (error: any) => {
        this.isLoggedIn = false;
        // this.toastr.error("Failed to fetch user details. Please try again.");
      }
    });
  }
  submitBooking() {
    if (this.isLoggedIn) {
      // Prepare booking details for logged-in user
      const finalDetails = {
        Name: this.userDetails.name,
        Email: this.userDetails.email,
        Gender: this.userDetails.gender,
        Phone: this.userDetails.phoneNumber,
        dateofbirth: this.userDetails.dateOfBirth,
        preferreddate: this.sharedservice.getSelectedDate(),
        preferredtime: this.sharedservice.getSelectedTime(),
        Doctor: [this.sharedservice.getDoctorId()],
        Specialization: [this.sharedservice.getSpecialistId()],
      };
  
      this.sharedservice.userbooking(finalDetails).subscribe({
        next: () => {
          this.toastr.success('Booking successful');
          this.stepper.next();
        },
        error: () => {
          this.toastr.error('Booking failed. Please try again.');
        },
      });
    }
  }
  
  onSubmit() {
    this.isFormSubmitted = true;
    const isFormValid = this.register.valid;

    if (isFormValid) {
      const formValue = this.register.value;

      const finalDetails = {
        Name: formValue.name,
        Email: formValue.email,
        Password: formValue.password,
        Gender: formValue.gender,
        Phone: formValue.phoneNumber,
        dateofbirth: formValue.dateOfBirth,
        preferreddate: this.sharedservice.getSelectedDate(),
        preferredtime: this.sharedservice.getSelectedTime(),
        Doctor: [this.sharedservice.getDoctorId()],
        Specialization: [this.sharedservice.getSpecialistId()],
      };

      console.log(finalDetails);
      this.sharedservice.userbooking(finalDetails).subscribe({
        next: (response) => {
          this.toastr.success('Booking successful');
          this.register.reset();
          this.isFormSubmitted = false;
          this.register.patchValue({ gender: 'Male' });
          this.errorMessage = '';
          this.isFormSubmitted = false;

          // Move to the next step
          this.stepper.next();
        },
        error: (error) => {
          this.isFormSubmitted = false;

          if (error.status === 400 && error.error?.message?.includes("email is already registered")) {
            // Set a custom error for the email field
            this.register.controls['email'].setErrors({ emailExists: true });
          } else {
            // Generic error handling
            this.toastr.error('Booking failed. Please try again.');
          }
        },
      });
    } else {
      console.log('Form is not valid');
      this.isFormSubmitted = false;
    }
  }
  
}