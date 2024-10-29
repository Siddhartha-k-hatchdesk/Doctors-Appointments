import { Location } from '@angular/common';
import { Token } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BlobOptions } from 'buffer';
import { jwtDecode }  from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated =false; 
  localStorage='';

  constructor(private router:Router,private location:Location) { }

  checkAuthentication():boolean{
   
    const token = this.getToken();
    if(token){
      const isExpired = this.isTokenExpired(token);
      this.isAuthenticated = !isExpired; // Set isAuthenticated based on token validity
      return !isExpired;
    }
    return false;
  }
    // const role=localStorage.getItem('role');
    // const token = localStorage.getItem('auth_token');
    // return !!(role && token);
   
    // this.isAuthenticated=!!role;
    // return this.isAuthenticated;
    isTokenExpired(token: string): boolean {
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
        return decoded.exp < currentTime;  // Check if token is expired
      } catch (error) {
        console.error("Error decoding token:", error);
        return true;  // Assume expired if decoding fails
      }
    }
  
  
  loginUser(roleId:string,token:string){

    localStorage.setItem('role',roleId);
    localStorage.setItem('auth_token',token);
    this.isAuthenticated=true;
  }
  
  logout(){
  localStorage.removeItem('role');
  localStorage.removeItem('auth_token');
    this.isAuthenticated=false;

    this.router.navigate(['/login']).then(()=>{
      this.location.replaceState('/login');
    })
  }
  getRole(): string | null {
    return localStorage.getItem('role');
  }
  getToken():string | null{
    return localStorage.getItem('auth_token');
  }
  // getUserId(): string | null {
  //   const token = localStorage.getItem('auth_token');
  //   if (token) {
  //     try {
  //       const decodedToken: any = jwtDecode(token);
  //       console.log('Decoded token:', decodedToken);  // Debugging: Log the decoded token
        
  //       // Check for the correct claim that holds the user ID
  //       return decodedToken?.Id || decodedToken?.sub || null;  // Use the correct key to get the user ID
  //     } catch (error) {
  //       console.error('Error decoding token:', error);
  //       return null;
  //     }
  //   }
  //   return null;
  // }
}
