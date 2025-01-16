import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoginServiceService } from '../Services/Login/login-service.service';
import { ToastrService } from 'ngx-toastr';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  token: string;
  resetPasswordForm: FormGroup;
  isLoading = false;
required: any;
  
  constructor(
    private loginService: LoginServiceService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private sharedservice: SharedDataServiceService,
    private fb: FormBuilder // FormBuilder for creating the form group
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token')!;

    // Form initialization with validation
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$") // regex for strong password
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator }); // Custom password match validator

    // Subscribe to loading state
    this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  // Custom password match validator
  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword ? { 'mismatch': true } : null;
  }

  resetPassword(form: any) {
    if (this.resetPasswordForm.invalid) {
      this.sharedservice.showLoading();
      this.toastr.warning('Please fix the errors before submitting');
      this.sharedservice.hideLoading();
      return;
    }

    // Show loading before API call
    this.sharedservice.showLoading();

    this.loginService.resetPassword(this.token, this.resetPasswordForm.value.newPassword).subscribe(
      (response) => {
        this.toastr.success('Password reset successfully.');
        this.sharedservice.hideLoading();

        // Reset the form after successful password reset
        form.resetForm();
      },
      (error) => {
        this.toastr.error('Error resetting password.');
        this.sharedservice.hideLoading();
      }
    );
  }
}
