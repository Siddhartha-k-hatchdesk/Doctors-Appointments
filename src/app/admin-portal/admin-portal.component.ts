import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserServiceService } from '../Services/User/user-service.service';

@Component({
  selector: 'app-admin-portal',
  templateUrl: './admin-portal.component.html',
  styleUrl: './admin-portal.component.css'
})
export class AdminPortalComponent implements OnInit {
  username: string | null=null;
  isMenuActive = false;
  constructor(private elementRef:ElementRef, private authService:AuthService, private router:Router,private userService:UserServiceService){}

  ngOnInit(): void {
    this.username = this.userService.getUserName();
    console.log('Retrieved username (email):', this.username);
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
  

  logout(){
    this.authService.logout();
    const isAdmin = this.authService.isAdmin(); // Assuming your AuthService has a method to check if the user is admin
    if (isAdmin) {
      this.router.navigateByUrl('/admin-login');
    } else {
      this.router.navigateByUrl('/login');
    }
  
   }
}
