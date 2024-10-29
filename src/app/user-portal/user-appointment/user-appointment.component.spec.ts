import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAppointmentComponent } from './user-appointment.component';

describe('UserAppointmentComponent', () => {
  let component: UserAppointmentComponent;
  let fixture: ComponentFixture<UserAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserAppointmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
