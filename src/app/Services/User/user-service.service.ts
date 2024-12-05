import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  getLocations() {
    throw new Error('Method not implemented.');
  }
  private url="https://localhost:7009/users";
  private username:string | null=null;

  constructor(private http:HttpClient){}

  setUser(username:string){
    this.username=username;
    localStorage.setItem('username',username);
  }

  getUserName():string|null{
    return this.username;
  }

  clearUser():void{
    this.username=null;
    localStorage.removeItem('username');
  }

  getDoctors():Observable<any[]>{
    return this.http.get<any[]>(`${this.url}/doctors`);
  }
  getDoctorsByLocation(locationId?: number): Observable<any> {
    return this.http.get<any[]>(`${this.url}/doctorsByLocation?locationId=${locationId}`).pipe(
      tap((response: any) => console.log("Filtered doctors response:", response))
    );
  }
  
  getDoctorName(): string {
    const doctorName=localStorage.getItem('doctorName') || '';
    console.log('Retrieved doctorName:', doctorName); // Add log to check the value
  return doctorName;
  }
  getSpecializations(): Observable<any> {
    return this.http.get<any>(`${this.url}/specializations`);
  }
  getDoctorsBySpecialization(specializationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/getDoctorsBySpecialization?specializationId=${specializationId}`)
    .pipe(
      delay(2000),
    );
  }
  getDoctorsByLocationAndSpecialization(locationId?: number, specializationId?: number): Observable<any[]> {
    let queryParams = '';

    if (locationId !== undefined) {
        queryParams += `locationId=${locationId}`;
    }
    
    if (specializationId !== undefined) {
        // Add '&' if there is already a query parameter
        queryParams += (queryParams ? '&' : '') + `specializationId=${specializationId}`;
    }

    return this.http.get<any[]>(`${this.url}/doctorsbySpecalizationAndLocation?${queryParams}`);
}

  
   
  getAppointments(doctorId?: number, specialistId?: number): Observable<any[]> {
    let params = new HttpParams();
    
    if (doctorId) {
      params = params.set('doctorId', doctorId.toString());
    }
    if (specialistId) {
      params = params.set('specialistId', specialistId.toString());
    }
  
    return this.http.get<any[]>(`${this.url}/Bookings/ds`, { params });
  }
  
getDoctorId(): number | null {
  const doctorId = localStorage.getItem('doctorId');
  return doctorId ? Number(doctorId) : null;
}

getSpecialistId(): number | null {
  const specialistId = localStorage.getItem('specialistId');
  return specialistId ? Number(specialistId) : null;
}
getLocation(searchTerm: string): Observable<any> {
  // Call the API with the search term
  return this.http.get<any>(`${this.url}/Location?search=${searchTerm}`);
}
// getDoctorsBySearch(searchTerm: string): Observable<any[]> {
//   return this.http.get<any[]>(`${this.url}/doctors/search`, { params: { searchTerm } });
// }
getuserdetailsbyId(id:number){
  return this.http.get<any>(`${this.url}/userdeatils/${id}`);
}
}
