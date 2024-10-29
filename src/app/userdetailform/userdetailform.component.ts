import { Component } from '@angular/core';
import { RegisterServiceService } from '../Services/Register/register-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';


@Component({
  selector: 'app-userdetailform',
  templateUrl: './userdetailform.component.html',
  styleUrl: './userdetailform.component.css'
})
export class UserdetailformComponent {
  register : FormGroup;
  isFormSubmitted:boolean=false;
errorMessage: string='';//varible to store error message

  constructor(private sharedservice:SharedDataServiceService,private registerService:RegisterServiceService){

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
  onSubmit(){
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
        dateofbirth:formValue.dateOfBirth,
        preferreddate: this.sharedservice.getSelectedDate(),
        preferredtime: this.sharedservice.getSelectedTime(),
        // Include any other fields that are part of BookingDTO
      };
      
      console.log(finalDetails);

      this.sharedservice.userbooking(finalDetails).subscribe({
        next: (response) => {
          alert('Registration successful');
          this.register.reset();
          this.isFormSubmitted = false;
          this.register.patchValue({ gender: 'Male' });
          this.errorMessage = ''; // Clear any error message
        },
        error: (error) => {
          this.isFormSubmitted = false; // Reset submit state on error
          if (error.status === 409) {
            alert('A user with this email already exists.');
          } else {
            alert('Registration failed. Please try again.');
          }
        }
      });
    } else {
      console.log('Form is not valid');
      this.isFormSubmitted = false; // Reset submit state if form invalid
    }
}
}