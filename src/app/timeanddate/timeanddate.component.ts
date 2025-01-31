import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import $ from 'jquery';
import { DoctorServiceService } from '../Services/Doctor/doctor-service.service';
import { ActivatedRoute } from '@angular/router';

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
  bookedSlots: any[] = [];

  constructor(
    private doctorservice: DoctorServiceService,
    private sharedservice: SharedDataServiceService,
    private renderer: Renderer2,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // First check if we have a doctor ID from the shared service
    this.doctorId = this.sharedservice.getDoctorId();

    if (!this.doctorId) {
      // If no doctor ID from the service, check query params
      this.route.queryParams.subscribe((params) => {
        this.doctorId = params['doctorId'];
        if (this.doctorId) {
          this.fetchDoctorAvailability(); // Fetch the availability when doctorId is available
        }
      });
    } else {
      // If doctor ID is available from shared service, fetch the availability
      this.fetchDoctorAvailability();
    }
  }

  fetchDoctorAvailability(): void {
    if (this.doctorId) {
      this.doctorservice.getDoctorAvailability(Number(this.doctorId)).subscribe((availability) => {
        console.log('Availability response:', availability);

        if (availability && availability.days) {
          this.doctorAvailability = availability.days;
          console.log('Doctor Availability:', this.doctorAvailability);

          this.daysOfWeek.forEach((item) => {
            const dayLowerCase = item.day.toLowerCase();
            item.isAvailable = this.doctorAvailability[dayLowerCase] !== undefined && this.doctorAvailability[dayLowerCase] !== null;
          });

          this.generateDates(); // Pehle available dates generate karo

          // Agar pehla available date set ho gaya hai, to uske slots load karo
          if (this.selectedDate) {
            this.loadDoctorSlots();
          }
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

      // Store the generated date and availability in the correct format
      const generatedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

      this.dates.push({
        day: dayName,
        date: generatedDate, // Use the generated date for UI display
        isSelected: false,
        isAvailable: isAvailable,
      });
    }

    // Automatically select the first available date and convert it
    const firstAvailableDate = this.dates.find((d) => d.isAvailable);
    if (firstAvailableDate) {
      firstAvailableDate.isSelected = true;
      this.selectedDate = firstAvailableDate;
      console.log('First Available Date Selected:', firstAvailableDate);

      // Log to see the date value before conversion
      console.log('Date before conversion:', firstAvailableDate.date);

      // Convert the first available date to the correct format (yyyy-MM-dd)
      const formattedDate = this.convertDateToISOFormat(firstAvailableDate.date);
      console.log('Formatted First Available Date:', formattedDate);

      // Update selected date in shared service with the formatted date
      this.sharedservice.setSelectedDate(formattedDate);

      // Programmatically trigger the slot refresh and load slots immediately
      this.refreshSlots(); // This will call loadDoctorSlots() as part of the refresh logic
    } else {
      console.log('No available dates found in the next 30 days.');
    }
  }


  selectDate(date: DateItem): void {
  console.log('Selecting date:', date);

  // Deselect all previous dates
  this.dates.forEach((d) => (d.isSelected = false));

  // Select the clicked date
  date.isSelected = true;
  this.selectedDate = date;

  // Convert the selected date to the correct format (yyyy-MM-dd)
  const formattedDate = this.convertDateToISOFormat(date.date);
  console.log('Formatted Date:', formattedDate);

  // Update selected date in shared service
  this.sharedservice.setSelectedDate(formattedDate);

  // Reset selected slot and clear booked slots
  this.selectedSlot = null;
  this.bookedSlots = [];  // Clear previous booked slots

  // Refresh slots for the new selected date
  this.refreshSlots();

  // Make the API call with the formatted date to get booked slots for the selected date
  this.doctorservice.getDoctorslot(Number(this.doctorId), formattedDate).subscribe((bookedSlots) => {
    console.log('Booked slots data from API:', bookedSlots);
  
    // Log the full structure of each slot to understand its shape
    bookedSlots.forEach((slot: any) => {
      console.log("Slot data:", slot);
    });
  
    // Check if bookedSlots contains valid data
    if (Array.isArray(bookedSlots) && bookedSlots.length > 0) {
      // Map the booked slots directly without filtering
      this.bookedSlots = bookedSlots.map((slot: {
        slot: { DateStr: any; Time: any; };
        date: { DateStr: any; Time: any; }; DateStr: any; Time: any; 
}) => {
        console.log("Mapping slot:", slot); // Log the slot being mapped
        if (slot && slot.date && slot.slot) {
          return { date: slot.date, slot: slot.slot }; // Use the correct property names
        } else {
          console.error("Invalid slot data:", slot);
          return null; // Skip invalid slots
        }
      });
  
      // Log the mapped booked slots
      console.log('Mapped booked slots:', this.bookedSlots);
    } else {
      console.log("No booked slots found.");
      this.bookedSlots = [];
    }
  
    this.generateSlots(); // Generate available slots based on the booked slots
  });
  
  
}

convertDateToISOFormat(dateString: string | undefined): string {
    if (!dateString) {
      console.error("Received undefined or empty dateString:", dateString);
      return '';  // Or return a default date or error string
    }

    // If the date is already in yyyy-MM-dd format, return as is
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(dateString)) {
      return dateString; // Already in the correct format
    }

    // Otherwise, format it from "Month Day" format (e.g., Jan 30) to "yyyy-MM-dd"
    const months: { [key: string]: string } = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05',
      'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10',
      'Nov': '11', 'Dec': '12'
    };

    const [monthName, day] = dateString.split(' ') as [keyof typeof months, string];
    const month = months[monthName];
    const year = new Date().getFullYear(); // Use current year for simplicity

    // Return the date in "yyyy-MM-dd" format
    return `${year}-${month}-${day.padStart(2, '0')}`;
  }
  
  loadDoctorSlots(): void {
    if (this.selectedDate && this.doctorId) {
      this.doctorservice.getDoctorslot(Number(this.doctorId), this.selectedDate.date).subscribe((bookedSlots) => {
        console.log('API Response:', bookedSlots); // Log the API response

        // Map the API response to format it properly
        if (bookedSlots && Array.isArray(bookedSlots)) {
          this.bookedSlots = bookedSlots.map((slot: { date: string; slot: string }) => {
            // Ensure data integrity
            if (!slot.date || !slot.slot) {
              console.error(`Invalid slot data: ${JSON.stringify(slot)}`);
              return { date: '', slot: '' }; // Return empty object if data is invalid
            }
            return {
              date: slot.date,  // This should be a valid date string
              slot: slot.slot   // This should be a valid time string
            };
          });
        } else {
          console.error('Invalid booked slots data:', bookedSlots);
        }

        this.refreshSlots(); // Update the slots
      });
    }
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
        const slotTime = formatTime(time);
  
        // Check if the slot is booked and exclude it from available slots
        if (!this.isSlotBooked(slotTime)) {
          this.morningSlots.push(slotTime); // Add available slot
        }
  
        lastMorningSlotTime = new Date(time);
        time.setMinutes(time.getMinutes() + 20);
      }
  
      // Afternoon slots
      if (endTime.getHours() >= 12) {
        if (lastMorningSlotTime) {
          lastMorningSlotTime.setHours(lastMorningSlotTime.getHours() + 1); // Add 1-hour gap
          time = new Date(Math.max(lastMorningSlotTime.getTime(), new Date('1970-01-01T12:00:00').getTime()));
        }
  
        while (time < endTime) {
          const slotTime = formatTime(time);
  
          // Check if the slot is booked and exclude it from available slots
          if (!this.isSlotBooked(slotTime)) {
            this.afternoonSlots.push(slotTime); // Add available slot
          }
  
          time.setMinutes(time.getMinutes() + 20);
        }
      }
    }
  }

  isSlotBooked(time: string): boolean {
    if (!this.selectedDate?.date) {
      console.error("Selected date is missing or undefined");
      return false;
    }
  
    const selectedDateFormatted = this.convertDateToISOFormat(this.selectedDate.date);
    const selectedDateTime = `${selectedDateFormatted} ${time}`;
  
    console.log("Booked slots data in isSlotBooked:", this.bookedSlots);
  
    const isBooked = this.bookedSlots.some(slot => {
      // Check if slot data has valid properties
      if (slot && slot.date && slot.slot) {
        const slotDateFormatted = this.convertDateToISOFormat(slot.date);
        const slotDateTime = `${slotDateFormatted} ${slot.slot}`;
        console.log(`Comparing selected time: ${selectedDateTime} with booked slot: ${slotDateTime}`);
        return selectedDateTime === slotDateTime;
      } else {
        console.error(`Invalid slot data: ${JSON.stringify(slot)}`);
        return false;
      }
    });
  
    console.log(`Checking if time ${selectedDateTime} is booked: ${isBooked}`);
    return isBooked;
  }
  

  refreshSlots(): void {
    // Clear any existing slots before generating new ones
    this.morningSlots = [];
    this.afternoonSlots = [];
  
    // Generate both morning and afternoon slots
    this.generateSlots();
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