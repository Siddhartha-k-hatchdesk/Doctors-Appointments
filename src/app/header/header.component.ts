import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  isGearMenuActive: boolean = false;

  constructor(private router: Router) {}

  // Toggle the visibility of the gear menu
  toggleGearMenu(): void {
    this.isGearMenuActive = !this.isGearMenuActive;
  }

  // Close the gear menu
  closeGearMenu(): void {
    this.isGearMenuActive = false;
  }
// Close the menu when clicking outside
@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target.closest('.gear-wrapper')) {
    this.closeGearMenu();
  }
}

  // Navigate to Admin Login
  navigateToAdminLogin(): void {
    this.router.navigate(['/admin/login']);
  }

  // Navigate to Doctor Login
  navigateToDoctorLogin(): void {
    this.router.navigate(['/doctor/login']);
  }
}
