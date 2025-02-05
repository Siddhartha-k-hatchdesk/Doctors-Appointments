import { Component, OnInit } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import { DoctorServiceService } from '../Services/Doctor/doctor-service.service';

@Component({
  selector: 'app-appointmentinteraction',
  templateUrl: './appointmentinteraction.component.html',
  styleUrl: './appointmentinteraction.component.css'
})
export class AppointmentinteractionComponent implements OnInit {
  selectedOption: string | null = null;
  doctorId: string | null = null;
  fees: any = null;
  constructor(private doctorservice:DoctorServiceService, private sharedService:SharedDataServiceService){}

  selectOption(option: string) {
    this.selectedOption = option;
    this.sharedService.setSelectedOption(option);
    console.log('Selected Option:', this.selectedOption);
  }
  ngOnInit(): void {
    // Retrieve the selected doctor ID from the shared service
    this.doctorId = this.sharedService.getDoctorId();
    
    console.log('Doctor ID in Appointment Interaction Component:', this.doctorId);
    // Fetch fees if doctor ID is available
    if (this.doctorId) {
      this.doctorservice.getDoctorfee(Number(this.doctorId)).subscribe({
        next: (response) => {
          this.fees = response; // Store the response
          console.log('Fetched Fees:', this.fees);
        },
        error: (error) => {
          console.error('Error fetching fees:', error);
        }
      });
    }  
}

}