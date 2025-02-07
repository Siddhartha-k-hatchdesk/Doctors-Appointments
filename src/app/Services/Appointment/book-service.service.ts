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
  Apiurl="https://localhost:7009/doctor";
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
  getAppointmentsForUser(
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy: string = 'Id', // Default sorting by Id
    isAscending: boolean = false, // Default descending
    searchQuery: string = ''
  ): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    let url = `${this.url}/appointments?pageNumber=${pageNumber}&pageSize=${pageSize}&sortBy=${sortBy}&isAscending=${isAscending}`;
    
    if (searchQuery) {
      url += `&searchQuery=${searchQuery}`;
    }
  
    return this.http.get(url, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error fetching appointments:', error);
        return throwError(() => new Error('Error fetching appointments, please try again later.'));
      })
    );
  }
  

  
  GetAllAppointments(pageNumber: number, pageSize: number, sortBy?: string, isAscending?: boolean, searchQuery?: string): Observable<any> {
    let params = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (sortBy) params += `&sortBy=${sortBy}`;
    if (isAscending !== undefined) params += `&isAscending=${isAscending}`;
    if (searchQuery) params += `&searchQuery=${searchQuery}`;
  
    return this.http.get<any>(`${this.url}/Booking/GetAll?${params}`);
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
    deleteAppointment(appointmentId: number): Observable<any> {
      return this.http.delete(`${this.url}/deleteappointment/${appointmentId}`).pipe(
        tap(() => console.log(`Appointment ${appointmentId} deleted successfully.`)),
        catchError(error => {
          console.error(`Error deleting appointment ${appointmentId}:`, error);
          return throwError(() => new Error('Failed to delete appointment'));
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

  getDoctorsByLocation(locationId?: number, specialistIds?: number[], doctorIds?: number[], page: number = 1, pageSize: number = 10): Observable<any> {
    let params = new HttpParams();
  
    if (locationId !== undefined) {
      params = params.set('locationId', locationId.toString());
    }
  
    if (specialistIds && specialistIds.length) {
      params = params.set('specialistIds', specialistIds.join(','));
    }
  
    if (doctorIds && doctorIds.length) {
      params = params.set('doctorIds', doctorIds.join(','));
    }
  
    params = params.set('page', page.toString());
    params = params.set('pageSize', pageSize.toString());
  
    return this.http.get(`${this.Apiurl}/GetDoctorsByLocation`, { params })
      .pipe(
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
   
  getNotifications(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/notifications/${userId}`);
}
 }
