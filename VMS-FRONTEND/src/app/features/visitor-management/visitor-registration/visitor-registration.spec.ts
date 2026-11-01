import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorRegistration } from './visitor-registration';

describe('VisitorRegistration', () => {
  let component: VisitorRegistration;
  let fixture: ComponentFixture<VisitorRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorRegistration],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
