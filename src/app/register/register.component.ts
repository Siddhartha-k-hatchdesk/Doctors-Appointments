import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterServiceService } from '../Services/Register/register-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    register : FormGroup;
    isFormSubmitted:boolean=false;

    constructor(private registerService:RegisterServiceService){
      this.register = new FormGroup({
        name : new FormControl("",[Validators.required]),
        email : new FormControl("",[Validators.required,Validators.email]),
        gender:new FormControl("Male"),
        phoneNumber: new FormControl("",[Validators.required]),
        password:new FormControl("",[Validators.required])
      })
    }
    onSubmit(){
      const isformvalid=this.register.valid;
      this.isFormSubmitted=true;
      if(this.register.valid){
        const formValue= this.register.value;

        const user={
          name:formValue.name,
          email:formValue.email,
          password:formValue.password,
          gender:formValue.gender,
          phone:formValue.phoneNumber
        };
        this.registerService.registerUser(user).subscribe({
          next:(response)=>{
            console.log('registraion succefully',response);
            //reset the form after succesfully submit
            this.register.reset();
            this.isFormSubmitted=false;
           // after submit the form value are reset mode
            this.register.patchValue({gender :'Male'});
          },
          error:(error)=>{
            console.error('registraion faild',error);
          }
        });
      }  else
      {
        console.log('form is not valid');
       }
      }
}
