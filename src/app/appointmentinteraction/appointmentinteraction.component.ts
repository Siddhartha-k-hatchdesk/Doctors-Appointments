import { Component } from '@angular/core';

@Component({
  selector: 'app-appointmentinteraction',
  templateUrl: './appointmentinteraction.component.html',
  styleUrl: './appointmentinteraction.component.css'
})
export class AppointmentinteractionComponent {
  selectedOption: string | null = null;

  selectOption(option: string) {
    this.selectedOption = option;
    console.log('Selected Option:', this.selectedOption);
  }
}
