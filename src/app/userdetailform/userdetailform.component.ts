import { Component, Input, OnInit } from '@angular/core';
import { RegisterServiceService } from '../Services/Register/register-service.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
   // Add these properties
   isAdminLogin: boolean = false;
   isDoctorLogin: boolean = false;
   isLoading=false;

  constructor(private router: Router, private sharedservice: SharedDataServiceService, private registerService: RegisterServiceService, private toastr: ToastrService) {
    this.register = new FormGroup(
      {
        name: new FormControl("", [Validators.required]),
        email: new FormControl("", [Validators.required, Validators.email]),
        gender: new FormControl(""),
        dateOfBirth: new FormControl(""),
        phoneNumber: new FormControl("", [
          Validators.pattern("^[0-9]{10}$")
        ]),
        password: new FormControl("", [
          Validators.required,
          Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")
        ]),
        confirmPassword: new FormControl("", [Validators.required])
      },
      { validators: this.passwordMatchValidator } // Attach the custom validator
    );
    
  }
  
  // Custom Validator for Matching Passwords
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
  
    // Return an error if passwords do not match
    return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
  };
  ngOnInit(): void {
    this.fetchUserDetails();
     // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
 
  
  fetchUserDetails() {
    this.sharedservice.loggedinUser().subscribe({
      next: (response: any) => {
        // console.log('User Response:', response);
        this.isLoggedIn = true; // User is logged in
        this.userDetails = {
          name: response.name,
          email: response.email,
          gender: response.gender,
          dateOfBirth: response.dateOfBirth,
          phoneNumber: response.phone,
        };
  
        // Debugging role-based logic
        this.isAdminLogin = response.roleId === 1; // Admin
        this.isDoctorLogin = response.roleId === 2; // Doctor
        // console.log('Role Check:', {
        //   isAdminLogin: this.isAdminLogin,
        //   isDoctorLogin: this.isDoctorLogin,
        //   isLoggedIn: this.isLoggedIn,
        // });
      },
      error: () => {
        this.isLoggedIn = false; // User is not logged in
        // console.log('User is not logged in');
      },
    });
  }
  

    submitBooking() {
    if (this.isLoggedIn) {
      // Prepare booking details for logged-in user
      this.sharedservice.showLoading();
      const specialization = this.sharedservice.getSpecialistId();
      const userDetails = {
        Name: this.userDetails.name,
        Email: this.userDetails.email,
        Gender: this.userDetails.gender,
        Phone: this.userDetails.phoneNumber,
        dateofbirth: this.userDetails.dateOfBirth,
        preferreddate: this.sharedservice.getSelectedDate(),
        preferredtime: this.sharedservice.getSelectedTime(),
        Doctor: [this.sharedservice.getDoctorId()],
        Specialization: specialization ? [specialization] : [], // Set empty array if no specialization
      };
      console.log("userdetails:",userDetails);
      this.sharedservice.userbooking(userDetails).subscribe({
        next: () => {
          this.toastr.success('Booking successful');
          this.stepper.next();
          this.sharedservice.hideLoading();
        },
        error: () => {
          this.toastr.error('Booking failed. Please try again.');
          this.sharedservice.hideLoading();
        },
      });
    }
  }
  
  
  onSubmit() {
    this.isFormSubmitted = true;
    const isFormValid = this.register.valid;

     // Log the form validation status and errors
  console.log('Form Valid:', isFormValid);
  console.log('Form Errors:', this.register.errors);
    if (isFormValid) {
      this.sharedservice.showLoading();
      const formValue = this.register.value;
      const specialization = this.sharedservice.getSpecialistId();
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
        Specialization: specialization ? [specialization] : [],
      };

      console.log("final list:",finalDetails);
      this.sharedservice.userbooking(finalDetails).subscribe({
        next: (response) => {
          this.toastr.success('Booking successful');
          this.register.reset();
          this.isFormSubmitted = false;
          this.sharedservice.hideLoading();
        //  this.register.patchValue({ gender: 'Male' });
          // this.errorMessage = '';
          // this.isFormSubmitted = false;

          // Move to the next step
          this.stepper.next();
        },
        error: (error) => {
          this.isFormSubmitted = false;
          this.sharedservice.hideLoading();
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