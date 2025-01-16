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
 
 profileImageUrl: string = 'https://lh5.googleusercontent.com/-b0-k99FZlyE/AAAAAAAAAAI/AAAAAAAAAAA/eu7opA4byxI/photo.jpg?sz=120'; // Default image

 constructor(private router:Router, private userService: UserServiceService,private authService:AuthService,private elementRef:ElementRef ){}

 ngOnInit(): void {
  this.username = this.userService.getUserName();
  const userId = localStorage.getItem('userId'); // Get the userId as a string
  if (userId) {
    const numericUserId = Number(userId); // Convert to number
    if (!isNaN(numericUserId)) { // Ensure it is a valid number
      this.userService.getUserDetails(numericUserId).subscribe(
        (response) => {
          console.log('User details:', response);
          this.profileImageUrl = response.profileImageUrl || null;

          console.log('Profile Image URL:', this.profileImageUrl);
          console.log('Updated Profile Image URL:', this.profileImageUrl);  // Use API image or fallback to default
        },
        (error) => {
          console.error('Error fetching user details:', error);
        }
      );
    } else {
      console.error('Invalid user ID:', userId);
    }
  }
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

