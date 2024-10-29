import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup,ReactiveFormsModule,Validators } from '@angular/forms';

@Component({
  selector: 'app-book-appointment',
  standalone:true,
  imports:[ReactiveFormsModule,CommonModule],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent {

 
  bookappoinment : FormGroup;
  isFormSubmitted:boolean = false;

  constructor(){
    this.bookappoinment = new FormGroup({
      appointmentFor:new FormControl("",[Validators.required]),
      name : new FormControl("",[Validators.required]),
      email : new FormControl("",[Validators.required,Validators.email]),
      dateOfBirth: new FormControl(""),
      gender:new FormControl(""),
      phoneNumber: new FormControl("",[Validators.required]),
      preferedDate: new FormControl("",[Validators.required]),
      preferedTime:new FormControl("")
    })
  }
  onSubmit(){
  const isformvalid=this.bookappoinment.valid;
  debugger;
  this.isFormSubmitted=true;
  }
}
