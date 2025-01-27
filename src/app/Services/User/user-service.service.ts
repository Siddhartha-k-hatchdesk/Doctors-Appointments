import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private profileImageSource = new BehaviorSubject<string>('');
  profileImage$ = this.profileImageSource.asObservable();


  updateProfileImage(url: string): void {
    this.profileImageSource.next(url); // Emit the new profile image URL
  }
  
  getLocations() {
    throw new Error('Method not implemented.');
  }
  private url="https://localhost:7009/users";
  private username:string | null=null;
  private doctorName: string | null= null;
  constructor(private http:HttpClient){}

  setDoctorName(name: string) {
    this.doctorName = name;
  }
  
  getDoctorName1(): string |null{
    return this.doctorName;
  }
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
  getUserDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/userdetails/${id}`);
  }
  updateUserDetails(id: number, userDetails: any): Observable<any> {
    return this.http.put<any>(`${this.url}/updateuserdetails/${id}`, userDetails);
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

  
   
getAppointments(
  doctorId: number | null = null,
  specialistId: number | null = null,
  searchQuery: string = '',   
  sortBy: string = 'preferreddate',
  isAscending: boolean = true, 
  pageNumber: number = 1,
  pageSize: number = 10
): Observable<any> {
  let params = new HttpParams();

  if (doctorId !== null) {
    params = params.set('doctorId', doctorId.toString());
  }
  if (specialistId !== null) {
    params = params.set('specialistId', specialistId.toString());
  }

  // Add search query, sort field, and sort order to the params
  if (searchQuery) {
    params = params.set('searchQuery', searchQuery);
  }
  params = params.set('sortBy', sortBy);
  params = params.set('isAscending', isAscending.toString());

  params = params.set('pageNumber', pageNumber.toString()).set('pageSize', pageSize.toString());

  return this.http.get<any>(`${this.url}/Bookings/ds`, { params });
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
  return this.http.get<any>(`${this.url}/userdetails/${id}`);
}
uploadProfileImage(formData: FormData): Observable<any> {
  return this.http.post(`${this.url}/upload-profile-image`, formData);
}

}
