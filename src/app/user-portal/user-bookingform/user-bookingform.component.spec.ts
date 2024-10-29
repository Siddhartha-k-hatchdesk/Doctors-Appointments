import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBookingformComponent } from './user-bookingform.component';

describe('UserBookingformComponent', () => {
  let component: UserBookingformComponent;
  let fixture: ComponentFixture<UserBookingformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserBookingformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserBookingformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
