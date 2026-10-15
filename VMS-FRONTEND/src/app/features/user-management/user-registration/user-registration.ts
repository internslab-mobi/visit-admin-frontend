import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Employee } from '../../../core/models/employee/employee.model';
import {
  AuthService,
  UserRole,
} from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-registration.html',
  styleUrl: './user-registration.css',
})
export class UserRegistrationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  employees: Employee[] = [];

  employeeSearch = '';
  showEmployeeResults = false;

  isLoadingEmployees = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  readonly roles: { value: UserRole; label: string }[] = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'FRONT_DESK', label: 'Front Desk' },
  ];

  readonly registrationForm = this.fb.nonNullable.group({
    employeeId: ['', Validators.required],
    role: ['FRONT_DESK' as UserRole, Validators.required],
  });

  get filteredEmployees(): Employee[] {
    const query = this.employeeSearch.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.employees
      .filter((employee) => {
        const fullName =
          `${employee.firstName} ${employee.lastName}`.toLowerCase();

        return (
          fullName.includes(query) ||
          employee.id.toLowerCase().includes(query) ||
          employee.email.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.errorMessage = '';

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees.filter(
          (employee) => employee.status?.toUpperCase() === 'ACTIVE',
        );

        this.isLoadingEmployees = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load employees:', error);

        this.isLoadingEmployees = false;
        this.errorMessage = 'Failed to load employees. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  onEmployeeSearch(value: string): void {
    this.employeeSearch = value;
    this.showEmployeeResults = true;

    // A new search invalidates the previously selected employee.
    this.registrationForm.controls.employeeId.setValue('');
  }

  selectEmployee(employee: Employee): void {
    this.registrationForm.controls.employeeId.setValue(employee.id);

    this.employeeSearch =
      `${employee.firstName} ${employee.lastName} (${employee.id})`;

    this.showEmployeeResults = false;
    this.registrationForm.controls.employeeId.markAsTouched();
  }

  clearEmployeeSelection(): void {
    this.employeeSearch = '';
    this.showEmployeeResults = false;
    this.registrationForm.controls.employeeId.setValue('');
  }

  submit(): void {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      employeeId: this.registrationForm.controls.employeeId.value,
      role: this.registrationForm.controls.role.value,
    };

    this.authService.createUser(request).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage =
          `Account created successfully for ${response.fullName}. ` +
          'An onboarding email has been requested.';

        this.registrationForm.reset({
          employeeId: '',
          role: 'FRONT_DESK',
        });

        this.clearEmployeeSelection();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isSubmitting = false;

        this.errorMessage =
          error?.error?.message ??
          'Failed to create the user account. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/employees']);
  }
}
