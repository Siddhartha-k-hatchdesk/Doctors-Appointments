import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperpageComponent } from './stepperpage.component';

describe('StepperpageComponent', () => {
  let component: StepperpageComponent;
  let fixture: ComponentFixture<StepperpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepperpageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StepperpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
