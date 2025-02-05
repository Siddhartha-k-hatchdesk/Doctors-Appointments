import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DoctorServiceService } from '../Doctor/doctor-service.service';
import { UserServiceService } from '../User/user-service.service';

@Injectable({
  providedIn: 'root'
})
export class SharedDataServiceService {
  url = "https://localhost:7009/users";
  
  private profileImageSubject = new BehaviorSubject<string | null>(null);
  profileImage$ = this.profileImageSubject.asObservable();

  
  // Update the profile image
  updateProfileImage(url: string): void {
    console.log('Shared service: Updating profile image URL to:', url);
    this.profileImageSubject.next(url);
  }
  // User Profile Image API
  fetchUserProfileImage(userId: number): void {
    // Assuming you have a service to fetch user details
    this.userservice.getUserDetails(userId).subscribe(
      (data: any) => {
        if (data && data.profileImageUrl) {
          this.updateProfileImage(data.profileImageUrl);  // Update shared state
        }
      },
      (error) => {
        console.error('Error fetching user profile image:', error);
      }
    );
  }
  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private doctorId: string | null = null;
  private specialistId: string | null = null;
  private selectedOption: string | null = null;
  private selectedDate: string | null = null;
  private selectedTime: string | null = null;
  private appointmentData: any = null;
  private appointmentId: number | null = null;
  

  // User details
  private userDetails: any = null;

  constructor(private httpclient: HttpClient, private doctorservice:DoctorServiceService,private userservice:UserServiceService) {}

  userbooking(BookingDTO: any): Observable<any> {
     const token = localStorage.getItem('auth_token');  // Retrieve the token from localStorage
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`  // Add the JWT token to the Authorization header
        });
    return this.httpclient.post(`${this.url}/bookappointment`, BookingDTO, { headers });
  }
  loggedinUser(): Observable<any> {
    const token = localStorage.getItem('auth_token'); // Retrieve the token from localStorage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Add the JWT token to the Authorization header
    });
  
    return this.httpclient.get(`${this.url}/getdetails`, { headers });
  }
  
 // Show/Hide loading spinner
 showLoading(): void {
  console.log('Loading started'); // Debug log
  this.loadingSubject.next(true);
  
}

hideLoading(): void {
  console.log('Loading stopped'); // Debug log
 this.loadingSubject.next(false);
}
setProfileImage(imageUrl: string): void {
  this.profileImageSubject.next(imageUrl);
}
fetchProfileImage(doctorId: number): void {
  this.doctorservice.getDoctorsById(doctorId).subscribe(
    (data: any) => {
      if (data && data.profileimage) {
        this.setProfileImage(data.profileimage); // Update shared state
      }
    },
    (error) => {
      console.error('Error fetching profile image:', error);
    }
  );
}
setAppointmentData(data: any): void {
  this.appointmentData = data;

}

getAppointmentData(): any {
  return this.appointmentData;
}
setAppointmentId(appointmentId: number | null) {
  this.appointmentId = appointmentId;
}


getAppointmentId(): number | null {
  return this.appointmentId;
}

  // Doctor ID methods
  setDoctorId(id: string): void {
    this.doctorId = id;
  }
  getDoctorId(): string | null {
    return this.doctorId;
  }

  // Specialist ID methods
  setSpecialistId(id: string): void {
    this.specialistId = id;
  }
  getSpecialistId(): string | null {
    return this.specialistId;
  }

  // Option methods
  setSelectedOption(option: string): void {
    this.selectedOption = option;
  }
  getSelectedOption(): string | null {
    return this.selectedOption;
  }

  // Date methods
  setSelectedDate(date: string): void {
    this.selectedDate = date;
  }
  getSelectedDate(): string | null {
    return this.selectedDate;
  }

  // Time methods
  setSelectedTime(time: string): void {
    this.selectedTime = time;
  }
  getSelectedTime(): string | null {
    return this.selectedTime;
  }

  // User details methods
  setUserDetails(details: any): void {
    this.userDetails = details;
  }
  getUserDetails(): any {
    return this.userDetails;
  } 
}
