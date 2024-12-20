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
    // In linear mode, the user can only go to the next step (immediate next step) or previous steps.
    if (this.linearModeSelected) {
      // Allow moving to the next step only if it's the immediate next step.
      if (index === this.selectedIndex + 1) {
        this.selectedIndex = index;  // Proceed to the next step.
      } else if (index <= this.selectedIndex) {
        this.selectedIndex = index;  // Allow going back to previous steps.
      } else {
        alert('Please complete the current step before proceeding to the next one.');
      }
    }
  }

  // Method to check if the step is clickable
  isStepClickable(index: number): boolean {
    // In linear mode, only the current or previous steps are clickable.
    // Allow clicking the immediate next step and the previous steps, but not skipping.
    return this.linearModeSelected ? index <= this.selectedIndex : true;
  }
}
