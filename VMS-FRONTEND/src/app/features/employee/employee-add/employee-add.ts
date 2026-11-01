import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { EmployeeService } from '../../../core/services/employee/employee.service';
import { DepartmentService } from '../../../core/services/department/department.service';
import { Department } from '../../../core/models/department/department.model';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './employee-add.html',
  styleUrl: './employee-add.css'
})
export class EmployeeAddComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly router = inject(Router);

  departments: Department[] = [];

  isSubmitting = false;
  errorMessage = '';

  employeeForm = this.fb.nonNullable.group({

    firstName: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    lastName: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]
    ],

    mobileNumber: [
      '',
      [
        Validators.required,
        Validators.maxLength(20)
      ]
    ],

    departmentId: [
      '',
      Validators.required
    ],

    designation: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ]

  });

  ngOnInit(): void {
    this.loadDepartments();
  }

  private loadDepartments(): void {

    this.departmentService.getDepartments().subscribe({

      next: (departments) => {
        this.departments = departments.filter(
          department =>
            department.status === 'ACTIVE'
        );
      },

      error: (error) => {
        console.error(
          'Failed to load departments:',
          error
        );

        this.errorMessage =
          'Failed to load departments. Please try again.';
      }

    });
  }

  submit(): void {

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request = {
      firstName:
        this.employeeForm.controls.firstName.value.trim(),

      lastName:
        this.employeeForm.controls.lastName.value.trim(),

      email:
        this.employeeForm.controls.email.value.trim(),

      mobileNumber:
        this.employeeForm.controls.mobileNumber.value.trim(),

      departmentId:
        this.employeeForm.controls.departmentId.value,

      designation:
        this.employeeForm.controls.designation.value.trim()
    };

    this.employeeService.createEmployee(request).subscribe({

      next: () => {
        this.isSubmitting = false;

        this.router.navigate([
          '/admin/employees'
        ]);
      },

      error: (error) => {
        this.isSubmitting = false;

        this.errorMessage =
          error?.error?.message ??
          'Failed to create employee. Please try again.';
      }

    });
  }

  cancel(): void {
    this.router.navigate([
      '/admin/employees'
    ]);
  }
}