import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, Observable, retry, tap, throwError } from 'rxjs';
import { BookingStatus } from '../../Enums/booking-status.enum';


@Injectable({
  providedIn: 'root'
})
export class BookServiceService {
  private filteredDoctors: any[] = [];
  url="https://localhost:7009/users";
  constructor(private http:HttpClient,private httpclient:HttpClient) { }

  bookappointment(booking: any): Observable<any> {
    const token = localStorage.getItem('auth_token');  // Retrieve the token from localStorage
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Add the JWT token to the Authorization header
    });
  
    return this.http.post<any>(`${this.url}/Booking`, booking, { headers })
      .pipe(
        retry(2),  // Retry the request up to 2 times in case of failure
        tap((response: any) => {
          console.log('Booking response:', response); // Log success response
        }),
        catchError((error: any) => {
          console.error('Error booking appointment:', error); // Log error to console
          return throwError(() => new Error('Error booking appointment, please try again later.'));
        })
      );
  }
  getAppointmentsForUser(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add the JWT token to the Authorization header
    });
    
    return this.http.get(`${this.url}/appointments`, { headers })
      .pipe(
        catchError((error: any) => {
          console.error('Error fetching appointments:', error); // Log error to console
          return throwError(() => new Error('Error fetching appointments, please try again later.'));
        })
      );
  }
  
    GetAllAppointmemts():Observable<any>{
      return this.http.get(this.url+'/Booking/GetAll')
    }
    
    updateStatus(id: number, status: BookingStatus): Observable<any> {
      return this.http.put(`${this.url}/Booking/UpdateStatus/${id}?newStatusId=${status}`, {});
    }
    // pickAppointment(appointmentId: number, doctorId: number):Observable<any> {
    //   return this.http.put(`${this.url}/Booking/Pick/${appointmentId}`, { doctorId });
    // }
    pickAppointment(appointmentId: number, doctorId: number): Observable<any> {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
    
      // Send doctorId as a plain integer in the body
      return this.http.put(`${this.url}/Booking/Pick/${appointmentId}`, doctorId, { headers })
        .pipe(
          catchError((error: any) => {
            console.error('Error picking the appointment:', error);
            return throwError(() => new Error('Error picking appointment, please try again later.'));
          })
        );
    }
    // New Method to get doctors by location, specialist, or doctor
  // getDoctorsByLocation(locationId?: number, specialistId?: number, doctorId?: number): Observable<any> {
  //   let params = new HttpParams();
    
  //   if (locationId !== undefined) {
  //     params = params.set('locationId', locationId.toString());
  //   }
    
  //   if (specialistId !== undefined) {
  //     params = params.set('specialistId', specialistId.toString());
  //   }
    
  //   if (doctorId !== undefined) {
  //     params = params.set('doctorId', doctorId.toString());
  //   }

  //   return this.http.get(`${this.url}/GetDoctorsByLocation`, { params })
  //     .pipe(delay(2000),
  //       retry(2),
  //       catchError((error: any) => {
  //         console.error('Error fetching doctors:', error);
  //         return throwError(() => new Error('Error fetching doctors, please try again later.'));
  //       })
  //     );
  // }

  getDoctorsByLocation(locationId?: number, specialistIds?: number[], doctorIds?: number[]): Observable<any> {
    let params = new HttpParams();
  
    if (locationId !== undefined) {
      params = params.set('locationId', locationId.toString());
    }
    
    if (specialistIds && specialistIds.length) {
      params = params.set('specialistIds', specialistIds.join(',')); // Convert array to comma-separated string
    }
    
    if (doctorIds && doctorIds.length) {
      params = params.set('doctorIds', doctorIds.join(',')); // Convert array to comma-separated string
    }
  
    return this.http.get(`${this.url}/GetDoctorsByLocation`, { params })
      .pipe(
        delay(2000),
        retry(2),
        catchError((error: any) => {
          console.error('Error fetching doctors:', error);
          return throwError(() => new Error('Error fetching doctors, please try again later.'));
        })
      );
  }
  
  
  setFilteredDoctors(doctors: any[]) {
    this.filteredDoctors = doctors;
  }
  getFilteredDoctors() {
    return this.filteredDoctors;
  }
   
 }
