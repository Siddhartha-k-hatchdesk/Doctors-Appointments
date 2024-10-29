
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  if(authService.checkAuthentication()){
    const role = authService.getRole();

    // Get the required role from route data (this is set in the route configuration)
    const requiredRole = route.data['role'];

    // Check if the user role matches the required role for the route
    if (role === requiredRole) {
      return true; // Allow access if role matches
    } 
    else
     {
      // Redirect based on user role if trying to access the wrong portal
      if(role==='1')
      {
        router.navigate(['/admin-portal'])
      }
      else if (role === '2') {
        router.navigate(['/doctor-portal']); // Redirect to doctor portal if user is a doctor
      } 
      else if (role === '3') {
        router.navigate(['/user-portal']); // Redirect to user portal if user is a normal user
      } else {
        router.navigate(['/login']); // Fallback if role is not recognized
      }
      return false;
    }
  
  }
  else{
    router.navigate(['/login']);
    return false;
  }
};
