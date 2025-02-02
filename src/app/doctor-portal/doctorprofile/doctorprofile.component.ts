import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../Services/User/user-service.service';
import { ActivatedRoute } from '@angular/router';
import { DoctorServiceService } from '../../Services/Doctor/doctor-service.service';
import { ToastrService } from 'ngx-toastr';
import { SharedDataServiceService } from '../../Services/sevices/shared-data-service.service';

@Component({
  selector: 'app-doctorprofile',
  templateUrl: './doctorprofile.component.html',
  styleUrl: './doctorprofile.component.css'
})
export class DoctorprofileComponent implements OnInit {
  isLoading:boolean=false;
  profileImage: string | null = null;
  specializations: any[]=[];
  locations: any[] = [];
  formData = { 
    name: '',
    email: '',
    specialization: '',
    location: '',
    education:'',
    experience:'',
    profileImage:'',
    days: {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false
  },
  startTime: '',
  endTime: '',
  inHospitalFee: 0,
  videoCallFee: 0,
  onCallFee: 0,
  offlineQueryFee: 0
  };
  constructor(private userService:UserServiceService,private route:ActivatedRoute,
    private doctorService:DoctorServiceService,private toastr:ToastrService,
    private sharedservice:SharedDataServiceService, private cdr:ChangeDetectorRef){
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
      const doctorId = this.route.snapshot.paramMap.get('id');
    
      if (doctorId) {
        const doctorIdNumber = +doctorId;
    
        // Fetch doctor details and initialize form data
        this.doctorService.getDoctorsById(doctorIdNumber).subscribe((data: any) => {
          console.log('Doctor Data:', data);
    
          if (data) {
            // Map the response to formData
            const availability = data.availability || [];
            const fees = data.fees?.[0] || {};
            this.profileImage = data.profileimage; // Set the profile image
            
            this.formData = {
              name: data.name,
              email: data.email,
              education: data.education,
              experience: data.experience,
              specialization: data.specialization,
              location: data.location,
              profileImage: data.profileimage,
              startTime: this.formatTime(availability[0]?.startTime),
              endTime: this.formatTime(availability[0]?.endTime),
              days: {
                mon: availability.some((a: any) => a.monday),
                tue: availability.some((a: any) => a.tuesday),
                wed: availability.some((a: any) => a.wednesday),
                thu: availability.some((a: any) => a.thursday),
                fri: availability.some((a: any) => a.friday),
                sat: availability.some((a: any) => a.saturday),
                sun: availability.some((a: any) => a.sunday),
              },
              inHospitalFee: fees.inHospitalFee || 0,
              videoCallFee: fees.videoCallFee || 0,
              onCallFee: fees.onCallFee || 0,
              offlineQueryFee: fees.offlineQueryFee || 0,
            };
    
            console.log('Prefilled Form Data:', this.formData);
            this.cdr.detectChanges(); // Manually trigger change detection
          }
    
          // Load additional data
          this.loadSpecializations();
          this.loadLocations();
        });
    
        // Fetch the latest profile image dynamically
        this.sharedservice.fetchProfileImage(doctorIdNumber); // Trigger the fetch
        this.sharedservice.profileImage$.subscribe((imageUrl) => {
          if (imageUrl) {
            this.profileImage = imageUrl; // Dynamically update profile image
            console.log('Profile image updated:', this.profileImage);
          }
        });
      } else {
        // Fallback for loading specializations and locations when no doctor ID
        this.loadSpecializations();
        this.loadLocations();
      }
    }
    
  formatTime(time: string): string {
    return time ? time.slice(0, 5) : '00:00';
  }
  
  
 
  onSubmit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id'); // Get doctor ID
    if (doctorId) {
      this.sharedservice.showLoading();
  
      // Map days to the backend expected structure
      const availabilities = [
        {
          monday: this.formData.days.mon,
          tuesday: this.formData.days.tue,
          wednesday: this.formData.days.wed,
          thursday: this.formData.days.thu,
          friday: this.formData.days.fri,
          saturday: this.formData.days.sat,
          sunday: this.formData.days.sun,
          startTime: this.formatTimeToHHMMSS(this.formData.startTime),
          endTime: this.formatTimeToHHMMSS(this.formData.endTime),
          isAvailable: Object.values(this.formData.days).some(day => day === true),
        },
      ];
  
      // Prepare updated data for submission
      const updatedData = {
        name: this.formData.name,
        email: this.formData.email,
        education: this.formData.education,
        experience: this.formData.experience,
        specializationId: this.formData.specialization,
        locationId: this.formData.location,
        availabilities: availabilities,
        profileImage: this.profileImage || undefined, // Use the current value only if set
        doctorFees: [
          {
            InHospitalFee: this.formData.inHospitalFee,
            VideoCallFee: this.formData.videoCallFee,
            OnCallFee: this.formData.onCallFee,
            OfflineQueryFee: this.formData.offlineQueryFee,
          },
        ],
      };
  
      console.log('Form Data being submitted:', updatedData);
  
      // Call the update API
      this.doctorService.updatedoctorprofile(+doctorId, updatedData).subscribe(
        (response) => {
          console.log('API response:', response);
          this.toastr.success('Doctor details updated successfully.');
          this.profileImage = response.profileImage || this.profileImage; // Update profile image only if returned
          this.sharedservice.hideLoading();
        },
        (error) => {
          console.error('API error:', error);
          this.toastr.error('Failed to update doctor details. Please try again.');
          this.sharedservice.hideLoading();
        }
      );
    } else {
      this.toastr.error('Invalid doctor ID.');
      this.sharedservice.hideLoading();
    }
  }
  
  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.sharedservice.showLoading();
      const formData = new FormData();
      const doctorId = this.route.snapshot.paramMap.get('id');
      formData.append('profileImage', file);
      formData.append('doctorId', doctorId || '');
  
      this.doctorService.uploadProfileImage(formData).subscribe(
        (response: any) => {
          this.toastr.success('Profile image uploaded successfully.');
          if (doctorId) {
            this.sharedservice.fetchProfileImage(+doctorId); // Fetch updated profile image
          }
          this.sharedservice.hideLoading();
        },
        (error: any) => {
          console.error('Error uploading image:', error);
          this.toastr.error('Failed to upload profile image.');
          this.sharedservice.hideLoading();
        }
      );
    }
  }
  
  
  fetchDoctorDetails(doctorId: number): void {
    this.doctorService.getDoctorsById(doctorId).subscribe(
      (data: any) => {
        // Update profile image and other details
        this.profileImage = data.profileimage; // Assuming `data.profileimage` contains the updated image URL
        this.formData.name = data.name; // Update other fields if needed
        this.sharedservice.hideLoading();
        this.cdr.detectChanges(); // Trigger UI update
      },
      (error: any) => {
        console.error('Error fetching doctor details:', error);
        this.toastr.error('Failed to fetch updated doctor details.');
        this.sharedservice.hideLoading();
      }
    );
  }
    
  

  loadSpecializations(): void {
    this.userService.getSpecializations().subscribe((data: any) => {
      this.specializations = data;
      // console.log('Specializations:', this.specializations);
  
      // Match the specialization name with dropdown options
      const matchingSpec = this.specializations.find(
        spec => spec.specializationName === this.formData.specialization
      );
  
      if (matchingSpec) {
        this.formData.specialization = matchingSpec.id; // Assign ID to formData
      }
      // console.log('Updated Form Specialization:', this.formData.specialization);
    });
  }
  
  loadLocations(): void {
    this.doctorService.getLocations().subscribe((data: any) => {
      this.locations = data;
      // console.log('Locations:', this.locations);
  
      // Match the location name with dropdown options
      const matchingLoc = this.locations.find(
        loc => loc.locationName === this.formData.location
      );
  
      if (matchingLoc) {
        this.formData.location = matchingLoc.id; // Assign ID to formData
      }
      // console.log('Updated Form Location:', this.formData.location);
    });
  }
  
  // Utility function to format time into HH:mm:ss
  formatTimeToHHMMSS(time: string): string {
    return time ? `${time}:00` : '00:00:00'; // Ensure the time format matches backend expectations
  }
  
  
}
