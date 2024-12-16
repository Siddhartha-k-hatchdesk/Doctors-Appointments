import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Doctors-Appointments';

  constructor(private router:Router){}

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Reset scroll to top for every route change
        window.scrollTo(0, 0);
      }
    });
  }
  showHeaderFooter(): boolean{
    const hiddenRoutes=['/register','/login','/admin/login','/doctor/login','/doctor-portal','/user-portal','/user-portal/user-appointment','/admin-portal','/user-portal/user-dashboard','/doctor-portal/appointments','/doctor-portal/doctor-dashboard',
      '/admin-portal/admin-dashboard','/admin-portal/appointments','/admin-portal/add-doctor','/admin-portal/add-doctor/:id','/admin-portal/doctor-list','/searchdoctor'
    ];
    const currentRoute = this.router.url.split('?')[0]; // Removes query params if present
  // const baseRoute = currentRoute.split('/:')[0]; // Removes any dynamic part after ':'
    return !hiddenRoutes.some(route=> currentRoute.startsWith(route));
  }
}
