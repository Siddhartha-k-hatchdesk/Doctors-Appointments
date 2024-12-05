import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
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
 isMenuActive = false;
 constructor(private userService: UserServiceService,private authService:AuthService,private elementRef:ElementRef ){}

 ngOnInit(): void {
   this.username=this.userService.getUserName();
   console.log(this.username);
 }
 logout(){
  this.authService.logout();
 }
 toggleMenu() {
  this.isMenuActive = !this.isMenuActive;
}
@HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const targetElement = event.target as HTMLElement;

  // Check if click is outside menu and toggle button
  if (
    this.isMenuActive &&
    !this.elementRef.nativeElement.querySelector('.menu').contains(targetElement) &&
    !this.elementRef.nativeElement.querySelector('.profile').contains(targetElement)
  ) {
    this.isMenuActive = false;
  }
}
// constructor(private router:Router){}

//   showHeaderFooter(): boolean{
//     const hiddenRoutes=['/user-doctor-layout'];
//     return !hiddenRoutes.includes(this.router.url);
//   }
}
