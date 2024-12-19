import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import  $ from 'jquery';
import { DoctorServiceService } from '../Services/Doctor/doctor-service.service';

interface DateItem {
  day: string;
  date: string;
  isSelected?: boolean; // Optional property
  isAvailable: boolean; 
}
@Component({
  selector: 'app-timeanddate',
  templateUrl: './timeanddate.component.html',
  styleUrl: './timeanddate.component.css'
})
export class TimeanddateComponent implements OnInit, AfterViewInit {
  daysOfWeek = [
    { day: 'Monday', isSelected: false, date: '', isAvailable: false },
    { day: 'Tuesday', isSelected: false, date: '', isAvailable: false },
    { day: 'Wednesday', isSelected: false, date: '', isAvailable: false },
    { day: 'Thursday', isSelected: false, date: '', isAvailable: false },
    { day: 'Friday', isSelected: false, date: '', isAvailable: false },
    { day: 'Saturday', isSelected: false, date: '', isAvailable: false },
    { day: 'Sunday', isSelected: false, date: '', isAvailable: false },
  ];
  dates: DateItem[] = [];
  morningSlots: string[] = [];
  afternoonSlots: string[] = [];
  selectedDate: DateItem | null = null;
  selectedSlot: string | null = null;
  doctorAvailability: any = {};  // Holds the doctor's availability data
  doctorId: string | null = null; // Assuming doctorId is passed or fetched from shared service

  constructor(
    private doctorservice: DoctorServiceService,
    private sharedservice: SharedDataServiceService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.doctorId = this.sharedservice.getDoctorId();  // Get doctor ID
    if (this.doctorId) {
      this.fetchDoctorAvailability();
    }
  }

  fetchDoctorAvailability(): void {
    if (this.doctorId) {
      this.doctorservice.getDoctorAvailability(Number(this.doctorId)).subscribe((availability) => {
        console.log('Availability response:', availability);
  
        if (availability && availability.days) {
          this.doctorAvailability = availability.days;
          console.log('Doctor Availability:', this.doctorAvailability);  // Log to check structure
          
          this.daysOfWeek.forEach((item) => {
            const dayLowerCase = item.day.toLowerCase();
            item.isAvailable = this.doctorAvailability[dayLowerCase] !== undefined && this.doctorAvailability[dayLowerCase] !== null;
          });
  
          this.generateDates();  // Now generate dates after availability is fetched
        } else {
          console.log('No availability data found for doctor.');
        }
      });
    }
  }

  generateDates(): void {
    if (!this.doctorAvailability || Object.keys(this.doctorAvailability).length === 0) {
      console.log('Doctor availability data is not available yet.');
      return;
    }

    const today = new Date();
    this.dates = [];

    const daysAvailability = this.doctorAvailability || {};

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = date.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
      const dayAvailability = daysAvailability[dayName];

      const isAvailable = dayAvailability && dayAvailability.startTime && dayAvailability.endTime;

      this.dates.push({
        day: dayName,
        date: date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
        isSelected: false,
        isAvailable: isAvailable,
      });
    }

    const firstAvailableDate = this.dates.find((d) => d.isAvailable);
    if (firstAvailableDate) {
      firstAvailableDate.isSelected = true;
      this.selectedDate = firstAvailableDate;
      console.log('First Available Date Selected:', firstAvailableDate);
  
      this.refreshSlots();
    } else {
      console.log('No available dates found in the next 30 days.');
    }
  }

  selectDate(date: DateItem): void {
    console.log('Selecting date:', date);
  
    this.dates.forEach((d) => (d.isSelected = false));
    
    date.isSelected = true;
    this.selectedDate = date;
    
    // Store selected date in shared service
    this.sharedservice.setSelectedDate(date.date);
  
    this.selectedSlot = null; // Reset selected slot
  
    this.refreshSlots();
  }
  

  generateSlots(): void {
    this.morningSlots = [];
    this.afternoonSlots = [];
  
    if (!this.selectedDate) {
      return;
    }
  
    const currentDayAvailability = this.doctorAvailability[this.selectedDate.day.toLowerCase()];
  
    if (currentDayAvailability) {
      const startTime = new Date(`1970-01-01T${currentDayAvailability.startTime}`);
      const endTime = new Date(`1970-01-01T${currentDayAvailability.endTime}`);
  
      const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      };
  
      let time = new Date(startTime);
      let lastMorningSlotTime = null;
  
      // Generate morning slots (up to 12:00 PM)
      while (time < endTime && time.getHours() < 12) {
        this.morningSlots.push(formatTime(time));
        lastMorningSlotTime = new Date(time); // Store the time of the last morning slot
        time.setMinutes(time.getMinutes() + 20);
      }
  
      // Debugging: Log the morning slots
      console.log('Morning Slots:', this.morningSlots);
  
      // If the end time is after 12:00 PM, start generating afternoon slots with a 1-hour gap after the last morning slot
      if (endTime.getHours() >= 12) {
        // Ensure we start the afternoon slots 1 hour after the last morning slot
        if (lastMorningSlotTime) {
          lastMorningSlotTime.setHours(lastMorningSlotTime.getHours() + 1); // Add 1 hour gap after last morning slot
          time = new Date(Math.max(lastMorningSlotTime.getTime(), new Date('1970-01-01T12:00:00').getTime())); // Start from the later of the 1-hour gap or 12:00 PM
        }
  
        // Generate afternoon slots starting from the adjusted time
        while (time < endTime) {
          this.afternoonSlots.push(formatTime(time));
          time.setMinutes(time.getMinutes() + 20);
        }
  
        // Debugging: Log the afternoon slots
        console.log('Afternoon Slots:', this.afternoonSlots);
      }
    }
  }
  

  refreshSlots(): void {
    this.generateSlots(); // Generate both morning and afternoon slots (no need to check for Saturday anymore)
  }

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
    this.sharedservice.setSelectedTime(slot);
  }

  isNextEnabled(): boolean {
    return !!this.selectedDate && !!this.selectedSlot;
  }

  ngAfterViewInit(): void {
    $(document).ready(() => {
      const move = "255px";
  
      const activeElement = $("div.active");
      const activeLeftPosition = activeElement.length ? activeElement.position()?.left ?? 0 : 0;
      const activeWidth = activeElement.length ? activeElement.width() ?? 0 : 0;
  
      const listWidth = $(".timeline-list").length ? $(".timeline-list").width() ?? 0 : 0;
  
      if (listWidth > 0) {
        const center = activeLeftPosition + activeWidth / 2 - listWidth / 2;
        $(".timeline-list").animate({ scrollLeft: "+=" + center }, "slow");
      }
  
      activeElement.next("div.timeline-item").css("border-left-width", "0");
  
      $(".prev-btn").click(() => {
        $(".timeline-list").animate({ scrollLeft: "-=" + move });
      });
  
      $(".next-btn").click(() => {
        $(".timeline-list").animate({ scrollLeft: "+=" + move });
      });
    });
  }
}
