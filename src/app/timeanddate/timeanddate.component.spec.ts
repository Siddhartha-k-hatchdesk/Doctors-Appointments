import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeanddateComponent } from './timeanddate.component';

describe('TimeanddateComponent', () => {
  let component: TimeanddateComponent;
  let fixture: ComponentFixture<TimeanddateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeanddateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeanddateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
