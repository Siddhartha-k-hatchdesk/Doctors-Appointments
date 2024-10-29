import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-doctor-portal',
  templateUrl: './doctor-portal.component.html',
  styleUrl: './doctor-portal.component.css'
})
export class DoctorPortalComponent implements  OnInit {
  username: string | null=null;
 
  constructor(private userService: UserServiceService,private authService:AuthService){}
 
  ngOnInit(): void {
    this.username=this.userService.getUserName();
    console.log('Retrieved username (email):', this.username);
  }
  logout(){
    this.authService.logout();
   }
}
