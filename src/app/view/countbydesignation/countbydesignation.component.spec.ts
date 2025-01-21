import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountbydesignationComponent } from './countbydesignation.component';

describe('CountbydesignationComponent', () => {
  let component: CountbydesignationComponent;
  let fixture: ComponentFixture<CountbydesignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CountbydesignationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountbydesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
