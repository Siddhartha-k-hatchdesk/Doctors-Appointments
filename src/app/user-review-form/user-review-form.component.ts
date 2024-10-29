import { Component } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';


@Component({
  selector: 'app-user-review-form',
  templateUrl: './user-review-form.component.html',
  styleUrl: './user-review-form.component.css'
})
export class UserReviewFormComponent {
  constructor(private sharedDataService:SharedDataServiceService) {}

  // Example function for setting selected doctor ID
  selectDoctor(doctorId: string): void {
    this.sharedDataService.setDoctorId(doctorId);
  }

  // Example function for setting selected option
  selectOption(option: string): void {
    this.sharedDataService.setSelectedOption(option);
  }

  // Example function for setting selected date
  selectDate(date: string): void {
    this.sharedDataService.setSelectedDate(date);
  }

  // Example function for setting selected time
  selectTime(time: string): void {
    this.sharedDataService.setSelectedTime(time);
  }
}