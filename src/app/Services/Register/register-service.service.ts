import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterServiceService {
  url="https://localhost:7009";
  constructor(private http:HttpClient) { }
  
  registerUser(user:
    {

        name:string,
        email:string,
        password:string,
        gender:string,
        phone:string
        
  }):Observable<any>{
      return this.http.post(this.url+'/users/register',user);
    }
    //add doctor(admin)
    addDoctor(doctorDTO:any):Observable<any>{
  return this.http.post(this.url+'/admin/add-doctor',doctorDTO);
}

}
