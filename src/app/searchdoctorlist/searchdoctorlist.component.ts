import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookServiceService } from '../Services/Appointment/book-service.service';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';


@Component({
  selector: 'app-searchdoctorlist',
  templateUrl: './searchdoctorlist.component.html',
  styleUrl: './searchdoctorlist.component.css'
})
export class SearchdoctorlistComponent implements OnInit {
  filteredDoctors: any[] = [];
  searchPerformed = false;
  selectedLocation: string = ''; // Store selected location
  selectedSpecialists: number[] = []; // Store selected specialists
  selectedDoctors: number[] = []; // Store selected doctors
  constructor(private sharedService:SharedDataServiceService, private route:ActivatedRoute,private bookservice:BookServiceService, private router:Router){}

  ngOnInit(): void {
    // Retrieve filtered doctors from the service
    this.filteredDoctors = this.bookservice.getFilteredDoctors();
    this.searchPerformed = true;

    // Get the query params from the URL
    this.route.queryParams.subscribe(params => {
      this.selectedLocation = params['location'] || '';
      this.selectedSpecialists = params['specialists'] ? JSON.parse(params['specialists']) : [];
      this.selectedDoctors = params['doctors'] ? JSON.parse(params['doctors']) : [];
    });

    if (this.filteredDoctors.length > 0) {
      console.log('Filtered Doctors in search doctor list:', this.filteredDoctors);
    } else {
      console.log('No doctors found.');
    }
  }
  onAppointmentClick(doctorId: number, specialistId: number): void {
  console.log('Selected Doctor ID:', doctorId);
  console.log('Selected Specialist ID:', specialistId);

  // Set the selected doctor and specialist in the shared service
  this.sharedService.setDoctorId(doctorId.toString()); 
  this.sharedService.setSelectedOption(specialistId.toString());

  // Now navigate to the next page
  this.router.navigate(['/stepperpage']);
  }
}

