import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserdetailformComponent } from './userdetailform.component';

describe('UserdetailformComponent', () => {
  let component: UserdetailformComponent;
  let fixture: ComponentFixture<UserdetailformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserdetailformComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserdetailformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
