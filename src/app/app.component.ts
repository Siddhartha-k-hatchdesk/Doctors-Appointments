import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Doctors-Appointments';

  constructor(private router:Router){}

  showHeaderFooter(): boolean{
    const hiddenRoutes=['/register','/login','/user-portal','/doctor-portal'];
    return !hiddenRoutes.includes(this.router.url);
  }
}
