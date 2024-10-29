import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentinteractionComponent } from './appointmentinteraction.component';

describe('AppointmentinteractionComponent', () => {
  let component: AppointmentinteractionComponent;
  let fixture: ComponentFixture<AppointmentinteractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppointmentinteractionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppointmentinteractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
