import { Component, OnInit } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { Router } from '@angular/router';
import { UserServiceService } from '../Services/User/user-service.service';
import { BookServiceService } from '../Services/Appointment/book-service.service';

declare var $: any; // Declares jQuery
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  specializations: any[]=[];
  location: any[]=[];
  selectedLocation: any = null;
  isLoading = false;
  
  constructor(private router:Router, private userservice:UserServiceService,private sharedservice:SharedDataServiceService,private bookservice:BookServiceService){
   
     // Subscribe to loading state
     this.sharedservice.loading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }

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
    const specializationName = this.specializations.find(spec => spec.id === specializationId)?.name || '';
  
    this.userservice.getDoctorsBySpecialization(specializationId).subscribe({
      next: (doctors) => {
        this.sharedservice.hideLoading();
        if (doctors && doctors.length > 0) {
          this.bookservice.setFilteredDoctors(doctors);
          this.sharedservice.setSpecialistId(specializationId.toString());
          this.router.navigate(['/searchdoctor'], {
            queryParams: {
              specialists: JSON.stringify([specializationId]),
            },
          });
        } else {
          this.router.navigate(['/searchdoctor'], {
            queryParams: {
              specialists: JSON.stringify([specializationId]),
            },
          });
          console.log("No doctors available.");
        }
      },
      error: (error) => {
        this.sharedservice.hideLoading();
        console.error("Error fetching doctors:", error);
      },
    });
  }
  
  
  
}
