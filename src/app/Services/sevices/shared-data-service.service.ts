import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class SharedDataServiceService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  loading$ = this.loadingSubject.asObservable();

  url="https://localhost:7009/users";
  constructor(private httpclient:HttpClient){}

  userbooking(BookingDTO:any)
:Observable<any>{
return this.httpclient.post(`${this.url}/userbookappointment`,BookingDTO);
}
  private doctorId: string | null = null;
  private selectedOption: string | null = null;
  private selectedDate: string | null = null;
  private selectedTime: string | null = null;
  private specialistId: string | null = null;
  
  // User details
  private userDetails: any = null; // Adjust type as necessary
  
  setDoctorId(id: string): void {
    this.doctorId = id;
  }
    
  getDoctorId(): string | null {
    return this.doctorId;
  }
  setSpecialistId(id: string): void {
    this.specialistId = id;
  }
  getSpecialistId(): string | null {
    return this.specialistId;
  }
  
 
  setSelectedOption(option: string): void {
    this.selectedOption = option;
  }

  getSelectedOption(): string | null {
    return this.selectedOption;
  }

  setSelectedDate(date: string): void {
    this.selectedDate = date;
  }

  getSelectedDate(): string | null {
    return this.selectedDate;
  }

  setSelectedTime(time: string): void {
    this.selectedTime = time;
  }

  getSelectedTime(): string | null {
    return this.selectedTime;
  }

  setUserDetails(details: any): void {
    this.userDetails = details;
  }

  getUserDetails(): any {
    return this.userDetails;
  }
  showLoading() {
    this.loadingSubject.next(true);
  }

  hideLoading() {
    this.loadingSubject.next(false);
  }
}