import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserServiceService } from '../User/user-service.service';
import { AuthService } from '../../auth.service';

@Injectable({
  providedIn: 'root'
})

export class LoginServiceService {

  url="https://localhost:7009/users";

  constructor(private http:HttpClient,private userService:UserServiceService,private authService:AuthService) { }
  loginUser(user:any):Observable<any>{
      return this.http.post(`${this.url}/LogIn`,user);
    }

    handleLoginResponse(response:any){
      console.log(response);
      if(response && response.username){
      this.userService.setUser(response.username);
      localStorage.setItem('role',response.roleId.toString());
      localStorage.setItem('auth_token',response.token);
        
    if (response.userId) {
      localStorage.setItem('userId', response.userId.toString()); // Save userId in local storage
      console.log("Stored User ID:", response.userId);
    } else {
      console.log("No User ID found in the response.");
    }
      // Check if doctorId and specialistId are present in the response
    if (response.doctorId) {
      localStorage.setItem('doctorId', response.doctorId.toString()); // Save doctorId
      console.log("Stored Doctor ID:", response.doctorId);
    }
    else {
      console.log("No Doctor ID found in the response.");
    }

    if (response.specialistId) {
      localStorage.setItem('specialistId', response.specialistId.toString()); // Save specialistId
      console.log("Stored Specialist ID:", response.specialistId);
    }
    else {
      console.log("No Specialist ID found in the response.");
    }
      // if(response.roleId===2){
      //   console.log("storing the doctor name",response.username);
      //   this.loginDoctor(response.username);
      // }
      this.authService.loginUser(response.roleId,response.token);
    
    }else{
        console.error('Login failed:response not found',response);
      }
    }
    loginDoctor(doctorName:string){
      localStorage.setItem('doctorName',doctorName);
    }
    // logout(): void{
    //   this.authService.logout();
    // }
    
}
