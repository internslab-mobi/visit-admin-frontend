import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorLog } from './visitor-log';

describe('VisitorLog', () => {
  let component: VisitorLog;
  let fixture: ComponentFixture<VisitorLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorLog],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
