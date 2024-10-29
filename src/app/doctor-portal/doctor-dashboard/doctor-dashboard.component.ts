import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../Services/User/user-service.service';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent implements OnInit {
  username: string | null=null;
 
  constructor(private userService: UserServiceService){}
 
  ngOnInit(): void {
    this.username=this.userService.getUserName();
    console.log(this.username);
  }
}
