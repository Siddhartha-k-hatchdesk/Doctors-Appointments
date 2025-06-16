import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RegisterServiceService } from '../Services/Register/register-service.service';
import { Router } from '@angular/router';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
    register : FormGroup;
    isFormSubmitted:boolean=false;
    isLoading = false;
    errorMessage: string='';//varible to store error message
    showPasswordField: boolean = false;
    showConfirmPasswordField: boolean = false;
    
    constructor(private registerService:RegisterServiceService,private router:Router,private sharedservice:SharedDataServiceService,private toastr:ToastrService){

      this.register = new FormGroup({
        name : new FormControl("",[Validators.required]),
        email : new FormControl("",[Validators.required,Validators.email]),
        gender:new FormControl("Male"),
        phoneNumber: new FormControl("",[
          Validators.pattern("^[0-9]{10}$")
        ]),
        password:new FormControl("",[
          Validators.required,
          Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$") 
        ]),
        confirmPassword: new FormControl("", [Validators.required])
      },
      { validators: this.passwordMatchValidator } // Attach the custom validator
    );
     // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
    }
    // Custom Validator for Matching Passwords
      passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;
      
        // Return an error if passwords do not match
        return password && confirmPassword && password !== confirmPassword ? { passwordsMismatch: true } : null;
      };
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
        this.sharedservice.showLoading();
        this.registerService.registerUser(user).subscribe({
          next:(response)=>{
            this.sharedservice.hideLoading();
            this.toastr.success('registraion succefully');
             // Navigate to login page after successful registration
          this.router.navigate(['/login']);
            //reset the form after succesfully submit
            this.register.reset();
            this.isFormSubmitted=false;
           // after submit the form value are reset mode
            this.register.patchValue({gender :'Male'});
            this.errorMessage='';//clear any error message
          },
          error:(error)=>{
            if(error.status===409){
              this.sharedservice.hideLoading();
              this.toastr.warning('A user with email already exites.');
            }
            this.sharedservice.hideLoading();
            this.toastr.error('registraion faild.Please try agin.');
          }
        });
      }  
      else
      {
        console.log('form is not valid');
       }
      }
      // Parameterized toggle function for both fields
    togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
      if (field === 'password') {
        this.showPasswordField = !this.showPasswordField;
      } else if (field === 'confirmPassword') {
        this.showConfirmPasswordField = !this.showConfirmPasswordField;
      }
    }
}
