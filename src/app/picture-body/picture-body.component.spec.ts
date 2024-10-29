import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureBodyComponent } from './picture-body.component';

describe('PictureBodyComponent', () => {
  let component: PictureBodyComponent;
  let fixture: ComponentFixture<PictureBodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PictureBodyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PictureBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
