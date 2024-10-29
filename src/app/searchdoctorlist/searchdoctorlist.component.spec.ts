import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchdoctorlistComponent } from './searchdoctorlist.component';

describe('SearchdoctorlistComponent', () => {
  let component: SearchdoctorlistComponent;
  let fixture: ComponentFixture<SearchdoctorlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchdoctorlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchdoctorlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
