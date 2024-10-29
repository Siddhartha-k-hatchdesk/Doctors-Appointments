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

 

  constructor(private loginService:LoginServiceService,private router:Router,private userService:UserServiceService,private route:ActivatedRoute){
       

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

          const roleId =response.roleId;
          let returnUrl='';
          
          //determine returnurl based on roleid
          if(roleId===1){
            returnUrl='/admin-portal';
          }
          else if(roleId===2){
            returnUrl='/doctor-portal';
          }
          else if(roleId===3){
            returnUrl ='/user-portal';
          }
          else{
            console.log('Unknown role');
          }
          console.log('returnUrl',returnUrl);
          console.log('roleId',roleId);

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
