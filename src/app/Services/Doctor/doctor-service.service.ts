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
  addSpecialization(specialist:any)
:Observable<any>{
return this.http.post(`${this.apiUrl}/add-specialization`,specialist);
}
deleteSpecialization(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/Delete-specialization/${id}`);
}
getDSpecializationById(id:number){
  return this.http.get<any>(`${this.apiUrl}/specialization/${id}`);
}
updateSpecialization(id:number,spec:any):Observable<any>{
  return this.http.put<any>(`${this.apiUrl}/Edit-specialization/${id}`,spec);
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

}
