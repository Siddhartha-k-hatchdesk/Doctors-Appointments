import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorServiceService {

  private apiUrl="https://localhost:7009/admin";
  private url="https://localhost:7009/doctor";

  constructor(private http:HttpClient) { }
  addDoctor(doctorDTO:any)
:Observable<any>{
return this.http.post(`${this.apiUrl}/add-doctor`,doctorDTO);
}
updateDoctor(id:number,doctorDTO:any):Observable<any>{
  return this.http.put<any>(`${this.apiUrl}/Edit-doctor/${id}`, doctorDTO);
}
deleteDoctor(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/Delete-doctor/${id}`);
}
getDoctorById(id:number){
  return this.http.get<any>(`${this.apiUrl}/doctors/${id}`);
}
addSpecialization(specialist: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/add-specialization`, specialist);
}

deleteSpecialization(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/Delete-specialization/${id}`);
}
getSpecializations(page: number = 1, pageSize: number = 5, searchQuery: string = ''): Observable<any> {
  return this.http.get<any>(`${this.url}/specializations?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery}`);
}

// getDSpecializationById(id:number){
//   return this.http.get<any>(`${this.apiUrl}/specialization/${id}`);
// }
updateSpecialization(id:number,spec:any):Observable<any>{
  return this.http.put<any>(`${this.apiUrl}/Edit-specialization/${id}`,spec);
}
getDoctors(page: number = 1, pageSize: number = 5, sortBy: string = '', isAscending: boolean = true, searchQuery: string = ''): Observable<any> {
  return this.http.get<any>(`${this.url}/doctors?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&isAscending=${isAscending}&searchQuery=${searchQuery}`);
}

getDoctorsById(id:number){
  return this.http.get<any>(`${this.url}/doctors/${id}`);
}
getLocations(): Observable<any> {
  return this.http.get<any>(`${this.url}/location`);
}
updatedoctorprofile(id:number,doctorDTO:any):Observable<any>{
  return this.http.put<any>(`${this.url}/Edit-doctor/${id}`,doctorDTO)
}
getDoctorAvailability(doctorId:number){
  return this.http.get<any>(`${this.url}/availability/${doctorId}`)
}
getDoctorfee(doctorId:number){
  return this.http.get<any>(`${this.url}/doctorfee/${doctorId}`)
}
updateDoctorStatus(doctorId: number, isActive: boolean): Observable<any> {
  return this.http.put<any>(
    `${this.url}/update-doctor-status?doctorId=${doctorId}&isActive=${isActive}`,
    {}
  );
}
uploadProfileImage(formData: FormData): Observable<any> {
  return this.http.post(`${this.url}/upload-profile-image`, formData);
}
getDoctorslot(doctorId:number,date:string){
  return this.http.get<any>(`${this.url}/booked-slots/${doctorId}/${date}`)
}
}
