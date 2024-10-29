import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-admin-portal',
  templateUrl: './admin-portal.component.html',
  styleUrl: './admin-portal.component.css'
})
export class AdminPortalComponent {
  constructor(private authService:AuthService){}

  logout(){
    this.authService.logout();
   }
}
