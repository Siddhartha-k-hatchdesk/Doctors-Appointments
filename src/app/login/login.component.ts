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
 

  constructor(private loginService:LoginServiceService,private router:Router,private userService:UserServiceService,private route:ActivatedRoute){
      this.isAdminLogin=this.route.snapshot.routeConfig?.path==='admin-login'; 

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
          } else {
            // Default login page for users/doctors
            if (roleId === 2) {
              returnUrl = '/doctor-portal';
            } else if (roleId === 3) {
              returnUrl = '/user-portal';
            } else {
              alert('Unauthorized access. Admins cannot log in here.');
              return;
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
          alert('login faild');
        }
      });
    }
    else
    {
      console.log('form is not valid');
    }
  }

}
