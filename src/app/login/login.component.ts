import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginServiceService } from '../Services/Login/login-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from '../Services/User/user-service.service';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: '.app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  login : FormGroup;
  isFormSubmitted:boolean=false;
  message: boolean=false;
  isAdminLogin:boolean=false;
  isDoctorLogin:boolean=false;
  showPasswordField: boolean = false;
  isLoading = false;
  errorMessage: string = '';  // Declare this property to hold error message
  forgotPasswordForm: FormGroup; // Form for the forgot password modal
  isForgotPasswordFormSubmitted: boolean = false;
  isForgotPasswordModalOpen: boolean = false; // Modal state
  captchaResponse: string | null = null;

  constructor(private toastr:ToastrService, private sharedservice:SharedDataServiceService, private loginService:LoginServiceService,private router:Router,private userService:UserServiceService,private route:ActivatedRoute)
  {
    
    const currentPath = this.route.snapshot.routeConfig?.path;
    this.isAdminLogin = currentPath === 'admin/login';
    this.isDoctorLogin = currentPath === 'doctor/login';
      
    this.login = new FormGroup({
      email : new FormControl("",[Validators.required,Validators.email]),
      password:new FormControl("",[Validators.required ])
    });
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
    });
     // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
}
openForgotPasswordModal() {
  this.isForgotPasswordModalOpen = true;
}

closeForgotPasswordModal() {
  this.isForgotPasswordModalOpen = false;
  this.isForgotPasswordFormSubmitted = false;
  this.forgotPasswordForm.reset();
}

resolved(captchaResponse: string | null) {
  this.captchaResponse = captchaResponse;
  console.log("Captcha Response:", captchaResponse ?? "No response received");
}

onForgotPasswordSubmit() {
  this.isForgotPasswordFormSubmitted = true;
  this.sharedservice.showLoading();
  if (this.forgotPasswordForm.invalid) {
    this.sharedservice.hideLoading();
    // If form is invalid, stop further processing
    return;
  }

  const email = this.forgotPasswordForm.get('email')?.value;
  console.log('Forgot Password submitted for email:', email);

  // Call the service method to trigger forgot password API
  this.loginService.forgotPassword(email).subscribe({
    next: (response) => {
      
      this.toastr.success('A password reset link has been sent to your email.');
      this.sharedservice.hideLoading();
    },
    error: (error) => {
      
      this.toastr.error('There was an issue sending the reset link.');
      this.sharedservice.hideLoading();

    }
  });

  // Optionally, close the modal after successful submission
  this.isForgotPasswordModalOpen = false;
  this.isForgotPasswordFormSubmitted = false;
  this.forgotPasswordForm.reset();
}

  onSubmit(){
    const isformvalid=this.login.valid; 
    this.isFormSubmitted=true;

    if(this.login.valid && this.captchaResponse){
      const formValue=this.login.value;

      const users={
        username:formValue.email,
        password:formValue.password,
        recaptchaToken: this.captchaResponse
      };
      this.sharedservice.showLoading();
      this.loginService.loginUser(users).subscribe({
        next:(response)=>{
          this.sharedservice.hideLoading(); // Stop the loading spinner
          this.loginService.handleLoginResponse(response);
           // Check if the response contains 'name' property
        console.log('Response:', response);

        if (response.name) {
          localStorage.setItem('name', response.username); // Save name to localStorage
        } else {
          console.error('Name not found in response!');
        }
          localStorage.setItem('roleId', response.roleId.toString()); // Save roleId
       
          const roleId =response.roleId;
          let returnUrl='';
          
          //determine returnurl based on roleid
          if (this.isAdminLogin) {
            // Only admin should be able to login on `/admin-login`
            if (roleId === 1) {
              returnUrl = '/admin-portal';
            } else {
              alert('Unauthorized access. Only admins can log in here.');
              return;
            }
          } else if(this.isDoctorLogin){
            // Default login page for users/doctors
            if (roleId === 2) {
              returnUrl = '/doctor-portal';
            }else{
              alert('Unauthorized access. Only doctors can log in here.');
              return;
            }
            } else {
              if (roleId === 3) {
              returnUrl = '/user-portal';
            } 
          }

          if(returnUrl){
          this.router.navigateByUrl(returnUrl);
          // alert('login successful');
          this.message=true;
          this.login.reset();
          }
        },
        error:(error)=>{
          this.sharedservice.hideLoading(); // Stop the loading spinner
          this.errorMessage = "We don't recognize that email or password";
        
        }
      });
    }
    else
    {
      console.log('Form is not valid or reCAPTCHA not verified');
    }
  }

  togglePasswordVisibility() {
    this.showPasswordField = !this.showPasswordField;
  }

}