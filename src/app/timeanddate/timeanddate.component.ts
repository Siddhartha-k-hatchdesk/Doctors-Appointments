import { AfterViewInit, Component, OnInit, Renderer2 } from '@angular/core';
import { SharedDataServiceService } from '../Services/sevices/shared-data-service.service';
import  $ from 'jquery';

interface DateItem {
  day: string;
  date: string;
  isSelected?: boolean; // Optional property
}
@Component({
  selector: 'app-timeanddate',
  templateUrl: './timeanddate.component.html',
  styleUrl: './timeanddate.component.css'
})
export class TimeanddateComponent implements OnInit,AfterViewInit {
  dates: DateItem[] = [];
  morningSlots: string[] = [];
  afternoonSlots: string[] = [];
  selectedDate: DateItem | null = null;
  selectedSlot: string | null = null;
  isSaturday: boolean = false;

  constructor(private sharedservice:SharedDataServiceService, private renderer:Renderer2){}
  ngOnInit(): void {
    this.generateDates();
    this.generateSlots();
  }
   generateDates(): void {
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
        
      const day = date.toLocaleString('en-US', { weekday: 'short' });

      this.dates.push({
        day: day,
        date: date.toLocaleString('en-US', { day: '2-digit', month: 'short' }),
        isSelected: i === 0, // Mark the first date (today) as selected
      });
    }

    // Set the selected date and determine if it's Saturday
    this.selectedDate = this.dates[0];
    this.isSaturday = this.selectedDate.day === 'Sat'; // Check if today is Saturday
  }
  selectDate(date: DateItem): void {
    this.dates.forEach((d) => (d.isSelected = false)); // Clear previous selections
    date.isSelected = true; // Mark the new selection
    this.selectedDate = date; // Update the selected date
  
    // Reset the selected slot when date is changed
    this.selectedSlot = null;
  
    // Update the Saturday check and refresh slots accordingly
    this.isSaturday = date.day === 'Sat';
    this.refreshSlots();

    this.sharedservice.setSelectedDate(date.date);
  }
  
  generateSlots(): void {
    // Clear existing slots
    this.morningSlots = [];
    this.afternoonSlots = [];
  
    let morningTime = new Date();
    morningTime.setHours(10, 0, 0);
    while (morningTime.getHours() < 12 || (morningTime.getHours() === 12 && morningTime.getMinutes() === 0)) {
      this.morningSlots.push(
        morningTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      morningTime.setMinutes(morningTime.getMinutes() + 15);
    }
  
    let afternoonTime = new Date();
    afternoonTime.setHours(15, 0, 0);
    while (afternoonTime.getHours() < 17 || (afternoonTime.getHours() === 17 && afternoonTime.getMinutes() === 0)) {
      this.afternoonSlots.push(
        afternoonTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
      afternoonTime.setMinutes(afternoonTime.getMinutes() + 15);
    }
  }
  
  refreshSlots(): void {
    // If it's Saturday, only show the morning slots, else show both morning and afternoon
    if (this.isSaturday) {
      this.afternoonSlots = []; // Clear afternoon slots on Saturday
    } else {
      this.generateSlots(); // Generate both morning and afternoon slots
    }
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
  
      // Get active element properties with safe fallback
      const activeElement = $("div.active");
      const activeLeftPosition = activeElement.length
        ? activeElement.position()?.left ?? 0
        : 0;
      const activeWidth = activeElement.length
        ? activeElement.width() ?? 0
        : 0;
  
      // Get timeline list properties with safe fallback
      const listWidth = $(".timeline-list").length
        ? $(".timeline-list").width() ?? 0
        : 0;
  
      // Calculate center only if required properties exist
      if (listWidth > 0) {
        const center = activeLeftPosition + activeWidth / 2 - listWidth / 2;
  
        // Center active div on page load
        $(".timeline-list").animate({ scrollLeft: "+=" + center }, "slow");
      }
  
      // Apply border adjustment if the next element exists
      activeElement
        .next("div.timeline-item")
        .css("border-left-width", "0");
  
      // Add click handlers
      $(".prev-btn").click(() => {
        $(".timeline-list").animate({ scrollLeft: "-=" + move });
      });
  
      $(".next-btn").click(() => {
        $(".timeline-list").animate({ scrollLeft: "+=" + move });
      });
    });
  }
  
}