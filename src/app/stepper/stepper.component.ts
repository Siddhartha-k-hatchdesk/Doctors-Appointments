import { CdkStepper } from '@angular/cdk/stepper';
import { ChangeDetectorRef, Component, ElementRef, OnInit } from '@angular/core';
import { UserServiceService } from '../Services/User/user-service.service';
import { Directionality } from '@angular/cdk/bidi';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper implements OnInit {
  linearModeSelected = true;
  doctorName: string | null=null;
  constructor(
    private userservice: UserServiceService,
    _dir: Directionality,  // Inject Directionality
    _changeDetectorRef: ChangeDetectorRef,  // Inject ChangeDetectorRef
    _elementRef: ElementRef<HTMLElement>  // Inject ElementRef
  ) {
    super(_dir, _changeDetectorRef, _elementRef);  // Pass the required arguments to the parent constructor
  }
 
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
ngOnInit():void {
  // Ensures that no steps can be clicked unless they are the current or previous step
  this.doctorName = this.userservice.getDoctorName1();
  console.log("selecteddoctor:",this.doctorName);
  this.selectedIndex = 0;  // Start at the first step
 
}
}
