import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlacklistDetails } from './blacklist-details';

describe('BlacklistDetails', () => {
  let component: BlacklistDetails;
  let fixture: ComponentFixture<BlacklistDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlacklistDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(BlacklistDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
