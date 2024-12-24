import { CdkStepper } from '@angular/cdk/stepper';
import { Component } from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper {
  linearModeSelected = true;

 // onClick method to prevent skipping any steps
 onClick(index: number): void {
  if (this.linearModeSelected) {
    // Users can only proceed if they are at the next step or a previous step
    if (index === this.selectedIndex + 1) {
      this.selectedIndex = index;  // Proceed to the next step
    } else if (index < this.selectedIndex) {
      this.selectedIndex = index;  // Allow going back to previous steps
    } else {
      // Prevent users from jumping ahead
      alert('Please complete the current step before proceeding to the next one.');
    }
  }
}

// Method to check if the step is clickable
isStepClickable(index: number): boolean {
  // In linear mode, only the current or previous steps are clickable
  return this.linearModeSelected ? index <= this.selectedIndex : true;
}

// Optionally you can also prevent skipping steps completely at initialization
ngOnInit() {
  // Ensures that no steps can be clicked unless they are the current or previous step
  this.selectedIndex = 0;  // Start at the first step
}
}
