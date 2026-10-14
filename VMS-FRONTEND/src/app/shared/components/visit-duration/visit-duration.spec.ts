import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitDuration } from './visit-duration';

describe('VisitDuration', () => {
  let component: VisitDuration;
  let fixture: ComponentFixture<VisitDuration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitDuration],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitDuration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
