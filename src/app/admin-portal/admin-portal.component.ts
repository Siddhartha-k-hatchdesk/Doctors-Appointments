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
  constructor(private elementRef:ElementRef, private authService:AuthService, private router:Router,private userService:UserServiceService){
    
  }

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
  
closeMenu() {
  this.isMenuActive = false; // Dropdown menu ko band karne ke liye
}

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/').then(() => {
        window.history.replaceState({}, '', '/'); // Redirect to HomeComponent
    });
  }
}
 // logout() {
  //   this.authService.logout();
  //   const isAdmin = this.authService.isAdmin(); 
  //   if (isAdmin) {
  //     this.router.navigate(['']).then(() => {
  //       window.history.replaceState({}, '', '/admin/login'); // Forcing URL update
  //     });
  //   } else {
  //     this.router.navigateByUrl('/login').then(() => {
  //       window.history.replaceState({}, '', '/login'); // Forcing URL update
  //     });
  //   }
  // }