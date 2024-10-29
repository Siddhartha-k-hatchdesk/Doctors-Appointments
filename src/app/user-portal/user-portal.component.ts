import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-user-portal',
  templateUrl: './user-portal.component.html',
  styleUrl: './user-portal.component.css'
})
export class UserPortalComponent implements OnInit {
 username: string | null=null;

 constructor(private userService: UserServiceService,private authService:AuthService){}

 ngOnInit(): void {
   this.username=this.userService.getUserName();
   console.log(this.username);
 }
 logout(){
  this.authService.logout();
 }
// constructor(private router:Router){}

//   showHeaderFooter(): boolean{
//     const hiddenRoutes=['/user-doctor-layout'];
//     return !hiddenRoutes.includes(this.router.url);
//   }
}
