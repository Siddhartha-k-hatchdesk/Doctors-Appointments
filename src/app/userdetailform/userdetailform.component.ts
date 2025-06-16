import { Component, Input, OnInit } from '@angular/core';
import { RegisterServiceService } from '../Services/Register/register-service.service';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkStepper } from '@angular/cdk/stepper';
import { UserServiceService } from '../Services/User/user-service.service';



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
  showPasswordField: boolean = false;
   // Add these properties
   isAdminLogin: boolean = false;
   isDoctorLogin: boolean = false;
   isLoading=false;
   editMode: boolean = false;
  appointmentId: number | null = null;


  constructor(private router: Router, private sharedservice: SharedDataServiceService, private registerService: RegisterServiceService,
    private toastr: ToastrService, private userService: UserServiceService,private route:ActivatedRoute) {
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
     // Get appointment ID from shared service or another source
     this.appointmentId = this.sharedservice.getAppointmentId() || null;

  console.log("Fetched Appointment ID from Shared Service in userdetails:", this.appointmentId);

 // If appointment ID exists, use it. Otherwise, set it to null or handle accordingly.
if (this.appointmentId) {
  this.appointmentId = this.appointmentId; // Appointment ID is available
  console.log("Appointment ID found in userdetails:", this.appointmentId);
} else {
  this.appointmentId = null;  // No Appointment ID, handling scenario when editing
  console.log("No Appointment ID found.");
}
    // Check if appointment is being edited
    const appointmentData = this.sharedservice.getAppointmentData();
    
    if (appointmentData) {
      this.register.patchValue({
        name: appointmentData.Name || '',
        email: appointmentData.Email || '',
        gender: appointmentData.Gender || '',
        dateOfBirth: appointmentData.dateofbirth || '',
        phoneNumber: appointmentData.Phone || '',
        consultationmode: appointmentData.consultationmode || '',
        preferreddate: appointmentData.preferreddate || '',
        preferredtime: appointmentData.preferredtime || '',
      });
    
      // Ensure doctor and specialization are set properly
      if (appointmentData.Doctor && appointmentData.Doctor.length > 0) {
        this.sharedservice.setDoctorId(appointmentData.Doctor[0]);  // Ensure valid doctor ID is set
      }
      if (appointmentData.Specialization && appointmentData.Specialization.length > 0) {
        this.sharedservice.setSpecialistId(appointmentData.Specialization[0]);
      }
    
      console.log("Selected Doctor ID after edit:", this.sharedservice.getDoctorId());
    }
    
  }
  
  enableEditMode() {
    this.editMode = true;
    this.register.patchValue({
      name: this.userDetails?.name,
      email: this.userDetails?.email,
      gender: this.userDetails?.gender,
      phoneNumber: this.userDetails?.phoneNumber
    });
  
    // Remove password validators in edit mode
    this.register.get('password')?.clearValidators();
    this.register.get('password')?.updateValueAndValidity();
    this.register.get('confirmPassword')?.clearValidators();
    this.register.get('confirmPassword')?.updateValueAndValidity();
  
    // Remove the custom validator
    this.register.setValidators(null);
    this.register.updateValueAndValidity();
  }
  
  
  
  cancelEdit() {
    this.editMode = false;
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
        consultationmode:this.sharedservice.getSelectedOption(),
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
  getInvalidControls() {
    const invalid = [];
    const controls = this.register.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push({ field: name, errors: controls[name].errors });
      }
    }
    return invalid;
  }
  onSubmit() {
    console.log("Fetching appointment data...");
  
    // **Shared Service se Appointment ID ko get karein**
    const appointmentId = this.sharedservice.getAppointmentId();
    console.log("Fetched Appointment ID from Shared Service:", appointmentId);
  
    const appointmentData = this.sharedservice.getAppointmentData();
    console.log("Fetched Appointment Data in onSubmit:", appointmentData);
  
    if (appointmentId) { 
      console.log("Appointment ID Present:", appointmentId);
    } else {
      console.warn("No Appointment ID Found!");
    }
  
    if (!this.register.valid) {
      console.log('Form is invalid');
      console.log('Invalid Fields:', this.getInvalidControls());
      return;
    }
  
    this.isFormSubmitted = true;
    const isFormValid = this.register.valid;
  
    if (appointmentId) { 
      this.register.get('password')?.clearValidators(); 
      this.register.get('password')?.updateValueAndValidity();
  
      this.register.get('confirmPassword')?.clearValidators(); 
      this.register.get('confirmPassword')?.updateValueAndValidity();
  
      this.register.setValidators(null);
      this.register.updateValueAndValidity();
    }
  
    if (isFormValid) {
      this.sharedservice.showLoading();
      const formValue = this.register.value;
      const doctorId = this.sharedservice.getDoctorId();
      const specializationId = this.sharedservice.getSpecialistId();
  
      const finalDetails = {
        Id: appointmentId || null,  // Use appointmentId from Shared Service
        Name: formValue.name,
        Email: formValue.email,
        Gender: formValue.gender,
        Phone: formValue.phoneNumber,
        dateofbirth: formValue.dateOfBirth,
        consultationmode: this.sharedservice.getSelectedOption(),
        preferreddate: this.sharedservice.getSelectedDate(),
        preferredtime: this.sharedservice.getSelectedTime(),
        Doctor: doctorId ? [doctorId] : [],
        Specialization: specializationId ? [specializationId] : [],
      };
  
      if (!finalDetails.Id) {
        (finalDetails as any).Password = formValue.password; 
      }
  
      if (finalDetails.Id) {
        this.userService.editAppointment(finalDetails.Id, finalDetails).subscribe({
          next: () => {
            this.toastr.success('Appointment updated successfully');
            this.stepper.next();
            this.sharedservice.hideLoading();
          },
          error: () => {
            this.toastr.error('Appointment update failed. Please try again.');
            this.sharedservice.hideLoading();
          },
        });
      } else {
        this.sharedservice.userbooking(finalDetails).subscribe({
          next: () => {
            this.toastr.success('Booking successful');
            this.register.reset();
            this.isFormSubmitted = false;
            this.sharedservice.hideLoading();
            this.stepper.next();
          },
          error: (error) => {
            this.isFormSubmitted = false;
            this.sharedservice.hideLoading();
            if (error.status === 400 && error.error?.message?.includes("email is already registered")) {
              this.register.controls['email'].setErrors({ emailExists: true });
            } else {
              this.toastr.error('Booking failed. Please try again.');
            }
          },
        });
      }
    } else {
      console.log('Form is not valid');
      this.isFormSubmitted = false;
    }
  }
  
  togglePasswordVisibility() {
    this.showPasswordField = !this.showPasswordField;
  }

  
}

