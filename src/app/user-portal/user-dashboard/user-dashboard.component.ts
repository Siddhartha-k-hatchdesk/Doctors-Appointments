import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../Services/User/user-service.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  username: string | null=null;
 
  constructor(private userService: UserServiceService){}
 
  ngOnInit(): void {
    this.username=this.userService.getUserName();
    console.log(this.username);
  }
}
