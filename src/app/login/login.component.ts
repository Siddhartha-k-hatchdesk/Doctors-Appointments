import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: '.app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  login : FormGroup;
  isFormSubmitted:boolean=false;

  constructor(){
    this.login = new FormGroup({
      email : new FormControl("",[Validators.required,Validators.email]),
      password:new FormControl("",[Validators.required])
    })
  }
  onSubmit(){
    const isformvalid=this.login.valid;
    this.isFormSubmitted=true;
  }

}
