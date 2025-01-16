import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataServiceService {
  url = "https://localhost:7009/users";

  // // Initialize BehaviorSubject with a helper method
  // private inProgressAppointments = new BehaviorSubject<number | null>(
  //   this.getInitialInProgressValue()
  // );
  // inProgress$ = this.inProgressAppointments.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private doctorId: string | null = null;
  private specialistId: string | null = null;
  private selectedOption: string | null = null;
  private selectedDate: string | null = null;
  private selectedTime: string | null = null;

  // User details
  private userDetails: any = null;

  constructor(private httpclient: HttpClient) {}

  // Helper method to fetch and parse value from localStorage
  // private getInitialInProgressValue(): number | null {
  //   const storedValue = localStorage.getItem('lastInProgressAppointment');
  //   if (storedValue !== null) {
  //     const parsedValue = parseInt(storedValue, 10);
  //     return isNaN(parsedValue) ? null : parsedValue; // Return null if parsing fails
  //   }
  //   return null; // Return null if no value in localStorage
  // }

  // Booking API call
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

 

  // Update in-progress appointment
  // updateInProgress(id: number | null): void {
  //   console.log("Updating InProgress ID in SharedDataServiceService to:", id);
  //   if (id !== null) {
  //     localStorage.setItem('lastInProgressAppointment', id.toString());
  //   } else {
  //     localStorage.removeItem('lastInProgressAppointment');
  //   }
  //   this.inProgressAppointments.next(id);
  //   console.log("Updated BehaviorSubject value:", this.inProgressAppointments.getValue());
  // }

  // // Get current in-progress appointment
  // getCurrentInProgress(): number | null {
  //   return this.inProgressAppointments.getValue();
  // }
}
