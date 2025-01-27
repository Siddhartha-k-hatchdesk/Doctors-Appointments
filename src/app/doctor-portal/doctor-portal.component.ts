import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { AuthService } from '../auth.service';
import { NotificationServiceService } from '../Services/Notification/notification-service.service';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { Router } from '@angular/router';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { DoctorServiceService } from '../Services/Doctor/doctor-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doctor-portal',
  templateUrl: './doctor-portal.component.html',
  styleUrl: './doctor-portal.component.css'
})
export class DoctorPortalComponent implements  OnInit,OnDestroy {
  username: string | null=null;
  notifications: string[] = [];
  DoctorId: number | null = null;
  isReady = false; // Default state is "Ready"
  profileImage: string | null = null;
  isMenuActive:boolean = false;

  constructor(private notificationService:NotificationServiceService, 
    private bookappointments:BookServiceService, private userService: UserServiceService,
    private authService:AuthService,private elementRef:ElementRef,private router:Router,
    private sharedservice:SharedDataServiceService,private doctorservice:DoctorServiceService,
  private toastr:ToastrService){}
 
  ngOnInit(): void {

    this.username = this.userService.getUserName();
    console.log('Retrieved username (email):', this.username);
 // Retrieve the doctor ID (assuming stored in session or local storage)
 this.DoctorId = Number(localStorage.getItem('doctorId'));
 if (this.DoctorId) {
  this.fetchDoctorDetails();
  // Fetch the latest profile image dynamically
  this.sharedservice.fetchProfileImage(this.DoctorId); // Trigger image fetch
  this.sharedservice.profileImage$.subscribe((imageUrl) => {
    if (imageUrl) {
      this.profileImage = imageUrl; // Update profile image dynamically
      console.log('Profile image updated:', this.profileImage);
    }
  });
 }
 else{
   console.error('Doctor ID not found.');
 }


 if (this.DoctorId) {
      this.notificationService.startConnection();
  
      // Subscribe to SignalR notifications
      this.notificationService.notifications$.subscribe(
        (notifications) => {
          console.log('Notifications received:', notifications);
          this.notifications = notifications;
        }
      );
      // Fetch stored notifications
      this.bookappointments.getNotifications(this.DoctorId).subscribe((data) => {
        console.log('Stored notifications:', data);
        this.notifications = [...data.map((n) => n.message), ...this.notifications];
      });
    } else {
      console.error('UserId is undefined. Cannot proceed with notifications.');
    }
  }
  
  fetchDoctorDetails(): void {
    if (this.DoctorId) {
      //this.sharedService.showLoading(); // Optional: Show loading spinner
      this.doctorservice.getDoctorsById(this.DoctorId).subscribe({
        next: (response) => {
          console.log('Doctor Details:', response);
        //  this.username = response.name;
          this.isReady = response.isActive;
          this.profileImage = response.profileimage; // Set current activity status
         // this.sharedService.hideLoading();
        },
        error: (error) => {
          console.error('Failed to fetch doctor details:', error);
         // this.sharedService.hideLoading();
        }
      });
    }
  }
  updateDoctorStatus(): void {
    if (this.DoctorId !== null) { // Ensure userId is not null
      this.checkProfileCompletion().then((isProfileComplete) => {
        if (isProfileComplete) {
          this.doctorservice.updateDoctorStatus(this.DoctorId!, this.isReady).subscribe({ // Non-null assertion
            next: (response) => {
              console.log(response);
              localStorage.setItem('isReady', JSON.stringify(this.isReady));
              this.toastr.success('Status updated successfully!');
            },
            error: (err) => {
              console.error('Failed to update status:', err);
              this.toastr.error('Failed to update status. Please try again.');
            }
          });
        } else {
          this.toastr.warning('Your profile is incomplete. Redirecting to profile page...');
          this.router.navigate(['/doctor-portal/doctor-profile', this.DoctorId!]); // Non-null assertion
        }
      });
    } else {
      console.error('User ID is not defined.');
    }
  }
  
  checkProfileCompletion(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.DoctorId) {
        this.doctorservice.getDoctorsById(this.DoctorId).subscribe({
          next: (response) => {
            // Check if required fields are filled
            const isProfileComplete =
              response.name &&
              response.email &&
              response.specialization &&
              response.location &&
              response.education &&
              response.experience &&
              response.availability?.length > 0 &&
              response.fees?.length > 0;

            resolve(!!isProfileComplete);
          },
          error: (error) => {
            console.error('Error fetching profile details:', error);
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
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

logout() {
  this.authService.logout();
  this.router.navigateByUrl('/').then(() => {
      window.history.replaceState({}, '', '/'); // Redirect to HomeComponent
  });
}  
   ngOnDestroy(): void {
    this.notificationService.stopConnection();
}

navigateToEditProfile() {
  this.router.navigate(['/doctor-portal/doctor-profile', this.DoctorId]);
}



closeMenu() {
  this.isMenuActive = false; // Dropdown menu ko band karne ke liye
}



}
// logout() {
  //   this.authService.logout();
  //   this.router.navigate(['']); // Redirect to home component
  // }
  // navigateToEditProfile(id: number): void {
//   this.router.navigate(['/admin-portal/add-doctor', id]);
// }
 // Fetch userId and start SignalR connection
    // this.userId = this.userService.getDoctorId();
    // console.log('Retrieved userId:', this.userId);

    //   logout() {
//     this.authService.logout();
//     const isAdmin = this.authService.isDoctor(); 
//     if (isAdmin) {
//         this.router.navigateByUrl('/doctor/login').then(() => {
//             window.history.replaceState({}, '', '/doctor/login'); // Forcing URL update
//         });
//     } else {
//         this.router.navigateByUrl('/').then(() => {
//             window.history.replaceState({}, '', '/'); // Redirecting to default HomeComponent
//         });
//     }
// }

//  onToggleChange() {
  //   localStorage.setItem('isReady', JSON.stringify(this.isReady));  // Save state
  // }
