import { Component, OnInit } from '@angular/core';
import { NavigationStart, NavigationEnd, Router } from '@angular/router';
import { SharedDataServiceService } from './Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Doctors-Appointments';
  isLoading= false;
  
  constructor(private router:Router, private sharedservice:SharedDataServiceService){
    
     // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.sharedservice.showLoading();
      } else if (event instanceof NavigationEnd) {
        this.sharedservice.hideLoading();
        window.scrollTo(0, 0); // Scroll to top after navigation
      }
    });
  }
  showHeaderFooter(): boolean{
    const hiddenRoutes=['/register','/login','/admin/login','/doctor/login','/doctor-portal','/user-portal','/user-portal/user-appointment','/admin-portal','/user-portal/user-dashboard','/doctor-portal/appointments','/doctor-portal/doctor-dashboard',
      '/admin-portal/admin-dashboard','/admin-portal/appointments','/admin-portal/add-doctor','/admin-portal/add-doctor/:id','/admin-portal/doctor-list','/searchdoctor','/resetpassword'
    ];
    const currentRoute = this.router.url.split('?')[0]; // Removes query params if present
  // const baseRoute = currentRoute.split('/:')[0]; // Removes any dynamic part after ':'
    return !hiddenRoutes.some(route=> currentRoute.startsWith(route));
  }
}
