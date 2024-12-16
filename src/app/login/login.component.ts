import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginServiceService } from '../Services/Login/login-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserServiceService } from '../Services/User/user-service.service';

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
  show_button: Boolean = false;
  show_eye: Boolean = false;
 

  constructor(private loginService:LoginServiceService,private router:Router,private userService:UserServiceService,private route:ActivatedRoute){
    const currentPath = this.route.snapshot.routeConfig?.path;
    this.isAdminLogin = currentPath === 'admin/login';
    this.isDoctorLogin = currentPath === 'doctor/login';
      
    this.login = new FormGroup({
      email : new FormControl("",[Validators.required,Validators.email]),
      password:new FormControl("",[Validators.required ])
    })
  }

  onSubmit(){
    const isformvalid=this.login.valid;
    this.isFormSubmitted=true;

    if(this.login.valid){
      const formValue=this.login.value;

      const users={
        username:formValue.email,
        password:formValue.password
      };
      this.loginService.loginUser(users).subscribe({
        next:(response)=>{
         
          this.loginService.handleLoginResponse(response);
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
          alert('user not found! Please check your Email or password.');
        }
      });
    }
    else
    {
      console.log('form is not valid');
    }
  }

  showPassword() {
    this.show_button = !this.show_button;
    this.show_eye = !this.show_eye;
  }

}
