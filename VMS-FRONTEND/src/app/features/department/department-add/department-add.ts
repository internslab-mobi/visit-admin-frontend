import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { DepartmentService } from '../../../core/services/department/department.service';

@Component({
  selector: 'app-department-add',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './department-add.html',
  styleUrl: './department-add.css'
})
export class DepartmentAddComponent {

  private readonly fb = inject(FormBuilder);
  private readonly departmentService = inject(DepartmentService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage = '';

  departmentForm = this.fb.nonNullable.group({
    departmentCode: [
      '',
      [
        Validators.required,
        Validators.maxLength(50)
      ]
    ],

    departmentName: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ]
  });

  get departmentCode() {
    return this.departmentForm.controls.departmentCode;
  }

  get departmentName() {
    return this.departmentForm.controls.departmentName;
  }

  submit(): void {

    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request = {
      departmentCode: this.departmentCode.value.trim(),
      departmentName: this.departmentName.value.trim()
    };

    this.departmentService.createDepartment(request).subscribe({

      next: () => {
        this.isSubmitting = false;

        this.router.navigate([
          '/admin/departments'
        ]);
      },

      error: (error) => {
        this.isSubmitting = false;

        this.errorMessage =
          error?.error?.message ??
          'Failed to create department. Please try again.';
      }

    });
  }

  cancel(): void {
    this.router.navigate([
      '/admin/departments'
    ]);
  }
}