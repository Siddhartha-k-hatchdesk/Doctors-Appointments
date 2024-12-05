import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { AuthService } from '../auth.service';
import { NotificationServiceService } from '../Services/Notification/notification-service.service';
import { BookServiceService } from '../Services/Appointment/book-service.service';

@Component({
  selector: 'app-doctor-portal',
  templateUrl: './doctor-portal.component.html',
  styleUrl: './doctor-portal.component.css'
})
export class DoctorPortalComponent implements  OnInit,OnDestroy {
  username: string | null=null;
  notifications: string[] = [];
  userId: any; 
  isMenuActive = false;
  constructor(private notificationService:NotificationServiceService, 
    private bookappointments:BookServiceService, private userService: UserServiceService,
    private authService:AuthService,private elementRef:ElementRef){}
 
  ngOnInit(): void {
    this.username = this.userService.getUserName();
    console.log('Retrieved username (email):', this.username);
  
    // Fetch userId and start SignalR connection
    this.userId = this.userService.getDoctorId();
    console.log('Retrieved userId:', this.userId);
  
    if (this.userId) {
      this.notificationService.startConnection();
  
      // Subscribe to SignalR notifications
      this.notificationService.notifications$.subscribe(
        (notifications) => {
          console.log('Notifications received:', notifications);
          this.notifications = notifications;
        }
      );
  
      // Fetch stored notifications
      this.bookappointments.getNotifications(this.userId).subscribe((data) => {
        console.log('Stored notifications:', data);
        this.notifications = [...data.map((n) => n.message), ...this.notifications];
      });
    } else {
      console.error('UserId is undefined. Cannot proceed with notifications.');
    }
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
   }
   ngOnDestroy(): void {
    this.notificationService.stopConnection();
}
}
