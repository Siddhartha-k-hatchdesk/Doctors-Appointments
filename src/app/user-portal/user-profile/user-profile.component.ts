import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../Services/User/user-service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: any = {}; // Object to hold user details
  isLoading = false;
  selectedFile: File | null = null;
  profileImageUrl: string = ''; // To store the updated profile image URL

  constructor(
    private sharedservice: SharedDataServiceService,
    private userservice: UserServiceService,
    private router: Router,
    private toastr: ToastrService
  ) {
    // Subscribe to loading state
    this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.click();
  }
  ngOnInit(): void {
    const userId = localStorage.getItem('userId'); // Assuming user ID is stored in localStorage
    if (userId) {
      console.log(`Fetching details for User ID: ${userId}`);
      this.loadUserDetails(+userId); // Convert ID to number
    } else {
      console.error('No user ID found');
    }

    // Subscribe to profileImage$ to get updated profile image
    this.sharedservice.profileImage$.subscribe((newImageUrl) => {
      if (newImageUrl) {
        console.log('Received new profile image URL:', newImageUrl);
        this.profileImageUrl = newImageUrl; // Update the profile image URL
      }
    });
  }

  loadUserDetails(id: number): void {
    console.log(`Calling getUserDetails API for User ID: ${id}`);
    this.userservice.getUserDetails(id).subscribe(
      (response) => {
        console.log('User details fetched successfully:', response);
        this.user = response;
        // Set the initial profile image if available
        this.profileImageUrl = response.profileImageUrl || ''; // Set initial profile image URL
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  saveChanges(): void {
    const userId = localStorage.getItem('userId'); // Assuming the user ID is stored in localStorage
    if (userId) {
      this.sharedservice.showLoading();
      console.log('Saving updated user details:', this.user);
      this.userservice.updateUserDetails(+userId, this.user).subscribe(
        (response) => {
          console.log('User details updated successfully:', response);
          this.toastr.success('User details updated successfully!');
          this.sharedservice.hideLoading();
        },
        (error) => {
          console.error('Error updating user details:', error);
          this.toastr.warning('Failed to update user details.');
          this.sharedservice.hideLoading();
        }
      );
    } else {
      console.error('No user ID found for updating.');
      this.toastr.warning('Unable to update. User ID not found.');
      this.sharedservice.hideLoading();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.selectedFile = input.files[0];
      this.uploadProfileImage();
    }
  }

  uploadProfileImage(): void {
    if (!this.selectedFile) {
      this.toastr.warning('Please select an image first!');
      return;
    }

    this.sharedservice.showLoading();
    const formData = new FormData();
    formData.append('userId', localStorage.getItem('userId') || '');
    formData.append('file', this.selectedFile);

    this.userservice.uploadProfileImage(formData).subscribe(
      (response: any) => {
        console.log('Profile image uploaded successfully:', response);
        this.toastr.success('Profile image uploaded!');

        // Emit the new profile image URL
        if (response.profileImageUrl) {
          this.sharedservice.updateProfileImage(response.profileImageUrl);
        }

        // Immediately fetch updated user details to refresh the image
        const userId = localStorage.getItem('userId');
        if (userId) {
          this.sharedservice.fetchUserProfileImage(+userId); // Refresh the image from service
        }

        this.sharedservice.hideLoading();
      },
      (error) => {
        console.error('Error uploading profile image:', error);
        this.toastr.error('Failed to upload profile image.');
        this.sharedservice.hideLoading();
      }
    );
  }
}
