import { Component, OnInit } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';


@Component({
  selector: 'app-timeanddate',
  templateUrl: './timeanddate.component.html',
  styleUrl: './timeanddate.component.css'
})
export class TimeanddateComponent implements OnInit {
  currentDate: Date = new Date();
  numberOfDays: number = 7;
  availableDates: Array<any> = [];
  timeSlots: Array<string> = [];
  bookedSlots: Array<string> = ['11:30 AM', '12:00 PM', '3:00 PM']; // Example booked slots
  selectedDate: string = this.currentDate.toDateString(); 
  selectedTime: string | null = null;

  constructor(private sharedSevice:SharedDataServiceService) { }

  ngOnInit(): void {
    this.generateDates();
    this.updateTimeSlots();
  }
  generateDates(): void {
    let daysAdded = 0;
    let date = new Date(this.currentDate);

    while (daysAdded < this.numberOfDays) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0) { // Skip Sundays
        this.availableDates.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
          fullDate: date.toDateString(),
          dayOfWeek: dayOfWeek
        });
        daysAdded++;
      }
      date.setDate(date.getDate() + 1);
    }
  }

  updateTimeSlots(): void {
    if (!this.selectedDate) return;

    const selectedDay = new Date(this.selectedDate).getDay();
    if (selectedDay === 6) {
      // Saturday - Half slots
      this.timeSlots = ['11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM'];
    } else {
      // Weekday - Full slots
      this.timeSlots = ['11:15 AM', '11:30 AM', '11:45 AM', '12:00 PM', '12:15 PM', '12:30 PM', '3:00 PM', '3:15 PM'];
    }
  }

  isSlotBooked(slot: string): boolean {
    return this.bookedSlots.includes(slot);
  }

  selectDate(event: Event, date: any): void {
    event.preventDefault(); // Prevents the page from navigating to the top
    this.selectedDate = date.fullDate;
    this.updateTimeSlots();
    this.selectedTime = null; // Clear the selected time when date changes
    this.sharedSevice.setSelectedDate(this.selectedDate);
    console.log('Selected Date:', this.selectedDate);
  }
  

  selectTime(time: string): void {
    this.selectedTime = time;
    this.sharedSevice.setSelectedTime(this.selectedTime);
    console.log('Selected Time:', this.selectedTime);
  }

  canProceed(): boolean {
    return this.selectedDate !== null && this.selectedTime !== null;
  }
}