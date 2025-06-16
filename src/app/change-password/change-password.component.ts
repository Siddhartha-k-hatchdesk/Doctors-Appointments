import { Component } from '@angular/core';
import { LoginServiceService } from '../Services/Login/login-service.service';
import { ToastrService } from 'ngx-toastr';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  isLoading:boolean=false;
  showPasswordField: boolean = false;
  showConfirmPasswordField: boolean = false;

  constructor(private loginservice:LoginServiceService,private toastr:ToastrService,private sharedservice:SharedDataServiceService){
       // Subscribe to loading state
       this.sharedservice.loading$.subscribe((loading) => {
        this.isLoading = loading;
      });
  }
    // Method to submit the password change request
    changePassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.sharedservice.showLoading();
       // this.message = "New password and confirmation do not match.";
        this.toastr.warning("New password and confirmation do not match.");
        this.sharedservice.hideLoading();
        return;
      }
  
      this.loginservice.changePassword(this.currentPassword, this.newPassword).subscribe(
        (response) => {
         // this.message = "Password has been successfully updated.";
          this.toastr.success("Password has been successfully updated.");
          this.sharedservice.hideLoading();
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        },
        (error) => {
        //  this.message = error?.error?.message || "An error occurred while updating the password.";
          this.toastr.error("An error occurred while updating the password.");
          this.sharedservice.hideLoading();
        }
      );
    }
    togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
      if (field === 'password') {
        this.showPasswordField = !this.showPasswordField;
      } else if (field === 'confirmPassword') {
        this.showConfirmPasswordField = !this.showConfirmPasswordField;
      }
    }
}
