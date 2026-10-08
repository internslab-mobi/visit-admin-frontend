import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorEdit } from './vendor-edit';

describe('VendorEdit', () => {
  let component: VendorEdit;
  let fixture: ComponentFixture<VendorEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(VendorEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
