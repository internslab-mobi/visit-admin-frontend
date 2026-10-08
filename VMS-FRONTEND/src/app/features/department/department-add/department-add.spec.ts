import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentAddComponent } from './department-add';

describe('DepartmentAdd', () => {
  let component: DepartmentAddComponent;
  let fixture: ComponentFixture<DepartmentAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentAddComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentAddComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
