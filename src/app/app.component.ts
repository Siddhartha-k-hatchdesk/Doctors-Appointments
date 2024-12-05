import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Doctors-Appointments';

  constructor(private router:Router){}

  showHeaderFooter(): boolean{
    const hiddenRoutes=['/register','/login','/admin-login','/doctor-portal','/user-portal','/user-portal/user-appointment','/admin-portal','/user-portal/user-dashboard','/doctor-portal/appointments','/doctor-portal/doctor-dashboard',
      '/admin-portal/admin-dashboard','/admin-portal/appointments','/admin-portal/add-doctor','/admin-portal/add-doctor/:id','/admin-portal/doctor-list','/searchdoctor'
    ];
    const currentRoute = this.router.url.split('?')[0]; // Removes query params if present
  const baseRoute = currentRoute.split('/:')[0]; // Removes any dynamic part after ':'
    return !hiddenRoutes.some(route=> currentRoute.startsWith(route));
  }
}
