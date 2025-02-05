import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserServiceService } from '../Services/User/user-service.service'; // Import UserServiceService
import { Subscription } from 'rxjs'; // Import Subscription to manage the observable subscription
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-thankyoupage',
  templateUrl: './thankyoupage.component.html',
  styleUrls: ['./thankyoupage.component.css']
})
export class ThankyoupageComponent implements OnInit {
  isLoggedIn: boolean = false;
  private loginStatusSubscription: Subscription | undefined;

  constructor(private sharedservice: SharedDataServiceService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to the login status observable
    this.loginStatusSubscription = this.sharedservice.loggedinUser().subscribe((status: boolean) => {
      this.isLoggedIn = status;

      // If the user is not logged in, redirect to the login page
      if (!this.isLoggedIn) {
        this.router.navigate(['/login']);
      }
    });
  }

  // Unsubscribe when the component is destroyed to avoid memory leaks
  ngOnDestroy(): void {
    if (this.loginStatusSubscription) {
      this.loginStatusSubscription.unsubscribe();
    }
  }
}
