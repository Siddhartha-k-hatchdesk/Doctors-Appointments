import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterServiceService } from '../Services/Register/register-service.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    register : FormGroup;
    isFormSubmitted:boolean=false;
  errorMessage: string='';//varible to store error message

    constructor(private registerService:RegisterServiceService){

      this.register = new FormGroup({
        name : new FormControl("",[Validators.required]),
        email : new FormControl("",[Validators.required,Validators.email]),
        gender:new FormControl("Male"),
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
            alert('registraion succefully');
            
            //reset the form after succesfully submit
            this.register.reset();
            this.isFormSubmitted=false;
           // after submit the form value are reset mode
            this.register.patchValue({gender :'Male'});
            this.errorMessage='';//clear any error message
          },
          error:(error)=>{
            if(error.status===409){
              alert('A user with email already exites.');
            }
            alert('registraion faild.Please try agin.');
          }
        });
      }  
      else
      {
        console.log('form is not valid');
       }
      }
}
