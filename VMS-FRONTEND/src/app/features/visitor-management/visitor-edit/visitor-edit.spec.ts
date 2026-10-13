import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorEdit } from './visitor-edit';

describe('VisitorEdit', () => {
  let component: VisitorEdit;
  let fixture: ComponentFixture<VisitorEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
