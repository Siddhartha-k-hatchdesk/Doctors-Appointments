import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';

import { BookServiceService } from '../Services/Appointment/book-service.service';
import { Router } from '@angular/router';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';

declare var $: any; // Declares jQuery

@Component({
  selector: 'app-pre-footer',
  templateUrl: './pre-footer.component.html',
  styleUrl: './pre-footer.component.css'
})
export class PreFooterComponent implements OnInit {
  specializations: any[]=[];
  location: any[]=[];
  selectedLocation: any = null;
  constructor(private router:Router, private userservice:UserServiceService,private sharedservice:SharedDataServiceService,private bookservice:BookServiceService){}

   ngOnInit(): void {
    this.loadSpecializations();
     
   }
   loadSpecializations(): void {
    this.userservice.getSpecializations().subscribe((data)=> {
      this.specializations = data;
      setTimeout(() => {
        $('.owl-carousel').owlCarousel({
          loop: true,
          margin: 10,
          dots: false,
          autoplay: true,
          responsive: {
            0: { items: 1 },
            400: { items: 2 },
            600: { items: 3 },
            1000: { items: 5 }
          }
        });
      }, 0);
    },
    (error)=>{
      console.error("error loading specialization",error);
    }
  );
  
  }
consultSpecialization(specializationId: number): void {
  this.sharedservice.showLoading();

  // Get the specialization name based on specializationId
  const specializationName = this.specializations.find(spec => spec.id === specializationId)?.name || '';

  // Assuming you have locationId selected already
  const locationId: number = this.selectedLocation ? Number(this.selectedLocation) : 0;
  const locationName = this.location.find(loc => loc.id === locationId)?.name || '';

  console.log('Selected Location Name:', locationName);
  console.log('Selected Specialization Name:', specializationName);

  // Fetch doctors by specialization
  this.userservice.getDoctorsBySpecialization(specializationId).subscribe({
    next: (doctors) => {
      this.sharedservice.hideLoading();
      if (doctors && doctors.length > 0) {
        this.bookservice.setFilteredDoctors(doctors);
        this.sharedservice.setSpecialistId(specializationId.toString());

        // Navigate with location name and specialization name
        this.router.navigate(['/searchdoctor'], {
          queryParams: {
            location: locationName,
            specialists: JSON.stringify([specializationId]),
            doctors: JSON.stringify([]),
          }
        });
      } else {
        this.router.navigate(['/searchdoctor']);
        console.log("No doctors available for this specialization.");
      }
    },
    error: (error) => {
      this.sharedservice.hideLoading();
      console.error("Error fetching doctors by specialization:", error);
    }
  });
}




}
