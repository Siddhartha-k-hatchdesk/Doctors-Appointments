import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../../Services/User/user-service.service';
import { ActivatedRoute } from '@angular/router';
import { DoctorServiceService } from '../../Services/Doctor/doctor-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-doctorprofile',
  templateUrl: './doctorprofile.component.html',
  styleUrl: './doctorprofile.component.css'
})
export class DoctorprofileComponent implements OnInit {
  specializations: any[]=[];
  locations: any[] = [];
  formData = { 
    name: '',
    email: '',
    specialization: '',
    location: '',
    education:'',
    experience:'',
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
  endTime: ''
  };
  constructor(private userService:UserServiceService,private route:ActivatedRoute,
    private doctorService:DoctorServiceService,private toastr:ToastrService){}

    ngOnInit(): void {
      const doctorId = this.route.snapshot.paramMap.get('id');
      if (doctorId) {
        this.doctorService.getDoctorsById(+doctorId).subscribe((data: any) => {
          if (data) {
            // Map the response to formData
            const availability = data.availability || [];
            this.formData = {
              name: data.name,
              email: data.email,
              education: data.education,
              experience: data.experience,
              specialization: data.specialization,
              location: data.location,
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
            };
          }
  
          console.log('Prefilled Form Data:', this.formData);
          this.loadSpecializations();
          this.loadLocations();
        });
      } else {
        this.loadSpecializations();
        this.loadLocations();
      }
    }
  formatTime(time: string): string {
    return time ? time.slice(0, 5) : '00:00';
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
  onSubmit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id'); // Get doctor ID
    if (doctorId) {
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
          isAvailable: Object.values(this.formData.days).some(day => day === true) // Mark as available if any day is true
        }
      ];
  
      // Prepare updated data for submission
      const updatedData = {
        name: this.formData.name,
        email: this.formData.email,
        education: this.formData.education,
        experience: this.formData.experience,
        specializationId: this.formData.specialization,
        locationId: this.formData.location,
        availabilities: availabilities // Send availability array
      };
  
      // Call the update API
      this.doctorService.updatedoctorprofile(+doctorId, updatedData).subscribe(
        response => {
          this.toastr.success('Doctor details updated successfully!');
        },
        error => {
          this.toastr.error('Failed to update doctor details. Please try again.');
        }
      );
    } else {
      this.toastr.error('Invalid doctor ID.');
    }
  }
  
  // Utility function to format time into HH:mm:ss
  formatTimeToHHMMSS(time: string): string {
    return time ? `${time}:00` : '00:00:00'; // Ensure the time format matches backend expectations
  }
  
  
}
