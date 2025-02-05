import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-user-portal',
  templateUrl: './user-portal.component.html',
  styleUrl: './user-portal.component.css'
})
export class UserPortalComponent implements OnInit {
 username: string | null=null;
 isMenuActive = false;
 
 profileImageUrl: string = 'https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120'; // Default image

 constructor(private router:Router, private userService: UserServiceService,private authService:AuthService,private elementRef:ElementRef,private sharedservice:SharedDataServiceService ){}

 ngOnInit(): void {
  this.username = this.userService.getUserName();
  const userId = localStorage.getItem('userId'); // Get the userId as a string
  if (userId) {
    const numericUserId = Number(userId); // Convert to number
    if (!isNaN(numericUserId)) {
      this.userService.getUserDetails(numericUserId).subscribe(
        (response) => {
          console.log('User details:', response);
          this.profileImageUrl = response.profileImageUrl || this.profileImageUrl;
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );
    } else {
      console.error('Invalid user ID:', userId);
    }
  }

  // Subscribe to profile image updates
  this.sharedservice.profileImage$.subscribe((newImageUrl) => {
    if (newImageUrl) {
      console.log('Received new profile image URL in UserPortalComponent:', newImageUrl);
      this.profileImageUrl = newImageUrl;
    }
  });
}
logout() {
  this.authService.logout();
  this.router.navigateByUrl('/').then(() => {
      window.history.replaceState({}, '', '/'); // Redirect to HomeComponent
  });
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

navigateToEditProfile() {
  this.router.navigate(['/user-portal/user-profile']);
}
}
// constructor(private router:Router){}

//   showHeaderFooter(): boolean{
//     const hiddenRoutes=['/user-doctor-layout'];
//     return !hiddenRoutes.includes(this.router.url);
//   }

