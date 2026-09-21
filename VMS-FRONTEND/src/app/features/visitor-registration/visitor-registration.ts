import { CommonModule } from '@angular/common';
import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Employee } from '../../core/models/employee/employee.model';
import {
  ProofType,
  RegistrationRequest,
  RegistrationResponse,
  RegistrationType,
  VisitorType
} from '../../core/models/registration/registration.model';

import { EmployeeService } from '../../core/services/employee/employee.service';
import { VisitService } from '../../core/services/visit/visit.service';

@Component({
  selector: 'app-visitor-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './visitor-registration.html',
  styleUrl: './visitor-registration.css'
})
export class VisitorRegistrationComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly visitService = inject(VisitService);
private readonly cdr = inject(ChangeDetectorRef);
  // --------------------------------------------------------------------------
  // Backend enum values
  // --------------------------------------------------------------------------

  readonly visitorTypes: readonly VisitorType[] = [
    'GUEST',
    'VISITOR',
    'VENDOR'
  ];

  readonly registrationTypes: readonly RegistrationType[] = [
    'PRE_REGISTRATION',
    'ARRIVAL_REGISTRATION'
  ];

  readonly proofTypes: readonly ProofType[] = [
    'AADHAAR',
    'PASSPORT'
  ];

  // --------------------------------------------------------------------------
  // Backend data
  // --------------------------------------------------------------------------

  employees: Employee[] = [];

  // --------------------------------------------------------------------------
  // Reactive form
  // --------------------------------------------------------------------------

registrationForm: FormGroup = this.fb.group({

  visitorType: [
    '',
    Validators.required
  ],

  registrationType: [
    '',
    Validators.required
  ],

  firstName: [
    '',
    [
      Validators.required,
      Validators.minLength(2),
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
      Validators.maxLength(254)
    ]
  ],

  mobileNumber: [
    '',
    [
      Validators.required,
      Validators.pattern(/^[6-9][0-9]{9}$/)
    ]
  ],

  companyName: [
    '',
    Validators.maxLength(150)
  ],

  purpose: [
    '',
    [
      Validators.required,
      Validators.maxLength(500)
    ]
  ],

  hostId: [
    '',
    Validators.required
  ],

  departmentName: [
    {
      value: '',
      disabled: true
    }
  ],

  expectedArrivalAt: [
    '',
    Validators.required
  ],

  expectedDepartureAt: [
    '',
    Validators.required
  ],

  remarks: [
    '',
    Validators.maxLength(1000)
  ],

  // ID PROOF - REQUIRED
  proofType: this.fb.control(
    '',
    {
      validators: [Validators.required]
    }
  ),

  proofNumber: this.fb.control(
    '',
    {
      validators: [
        Validators.required,
        Validators.maxLength(100)
      ]
    }
  ),

  proofImage: this.fb.control<File | null>(
    null,
    {
      validators: [Validators.required]
    }
  ),

  // NDA - OPTIONAL
  ndaDocument: this.fb.control<File | null>(
    null
  )

});

  // --------------------------------------------------------------------------
  // UI state
  // --------------------------------------------------------------------------

  isLoadingEmployees = false;
  isSubmitting = false;

  registrationSuccess = false;

  createdVisit: RegistrationResponse | null = null;

  errorMessage = '';
  successMessage = '';

  currentDate = new Date();

  minDateTime = this.getCurrentDateTime();

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  ngOnInit(): void {
    this.loadEmployees();
  }

  // --------------------------------------------------------------------------
  // Employee
  // --------------------------------------------------------------------------

  private loadEmployees(): void {

    this.isLoadingEmployees = true;
    this.errorMessage = '';

    this.employeeService.getEmployees().subscribe({
      next: (employees) => {

        this.employees = employees.filter(
          employee => employee.status === 'ACTIVE'
        );

        this.isLoadingEmployees = false;
      },

      error: (error) => {

        console.error(
          'Failed to load employees:',
          error
        );

        this.isLoadingEmployees = false;

        this.errorMessage =
          error?.error?.message ??
          'Unable to load employees.';
      }
    });
  }

  onEmployeeChange(): void {

    const hostId =
      this.registrationForm.get('hostId')?.value;

    const employee =
      this.employees.find(
        item => item.id === hostId
      );

    this.registrationForm.patchValue({
      departmentName:
        employee?.department?.departmentName ?? ''
    });
  }

  getEmployeeDisplayName(employee: Employee): string {

    return `${employee.employeeCode} — ${employee.firstName} ${employee.lastName}`;
  }

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------

  // submitRegistration(): void {

  //   this.clearMessages();

  //   if (this.registrationForm.invalid) {

  //     this.registrationForm.markAllAsTouched();

  //     this.errorMessage =
  //       'Please complete all required fields.';

  //     return;
  //   }

  //   const request =
  //     this.buildRegistrationRequest();

  //   if (!request) {
  //     return;
  //   }

  //   this.isSubmitting = true;

  //   this.visitService.register(request).subscribe({

  //     next: (response) => {

  //       this.createdVisit = response;

  //       this.registrationSuccess = true;

  //       this.isSubmitting = false;

  //       this.successMessage =
  //         response.message ||
  //         'Visit registered successfully.';
  //     },

  //     error: (error) => {

  //       console.error(
  //         'Visit registration failed:',
  //         error
  //       );

  //       this.isSubmitting = false;

  //       this.handleRegistrationError(error);
  //        this.cdr.detectChanges();
  //     }
  //   });
  // }

  submitRegistration(): void {

  this.clearMessages();

  if (this.registrationForm.invalid) {
    this.registrationForm.markAllAsTouched();

    this.errorMessage =
      'Please complete all required fields.';

    return;
  }

  const request = this.buildRegistrationRequest();

  if (!request) {
    return;
  }

  this.isSubmitting = true;

  this.visitService.register(request).subscribe({

    next: (response: RegistrationResponse) => {

      console.log('Registration successful:', response);

      this.createdVisit = response;
      this.registrationSuccess = true;
      this.isSubmitting = false;

      this.successMessage =
        response.message || 'Visit registered successfully.';

      this.cdr.detectChanges();

      console.log(
        'registrationSuccess:',
        this.registrationSuccess
      );

      console.log(
        'createdVisit:',
        this.createdVisit
      );
    },

    error: (error) => {

      console.error(
        'Visit registration failed:',
        error
      );

      this.isSubmitting = false;

      this.handleRegistrationError(error);

      this.cdr.detectChanges();
    }

  });
}

  onNdaFileSelected(event: Event): void {

  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    this.errorMessage = 'NDA file size must not exceed 5 MB.';
    input.value = '';
    return;
  }

  if (file.type !== 'application/pdf') {
    this.errorMessage = 'Only PDF files are allowed for NDA.';
    input.value = '';
    return;
  }

  this.registrationForm.patchValue({
    ndaDocument: file
  });

  this.errorMessage = '';
}

getSelectedNdaFileName(): string {

  const file =
    this.registrationForm.get('ndaDocument')?.value;

  return file instanceof File
    ? file.name
    : '';
}

  // --------------------------------------------------------------------------
  // Build backend request
  // --------------------------------------------------------------------------

  private buildRegistrationRequest():
    RegistrationRequest | null {

    const value =
      this.registrationForm.getRawValue();

    const arrival =
      this.parseDateTime(value.expectedArrivalAt);

    const departure =
      this.parseDateTime(value.expectedDepartureAt);

    if (!arrival || !departure) {

      this.errorMessage =
        'Please enter valid arrival and departure date and time.';

      return null;
    }

    if (departure <= arrival) {

      this.errorMessage =
        'Expected departure time must be after expected arrival time.';

      return null;
    }

    const visitDate =
      this.formatDate(arrival);

    if (
      this.formatDate(departure) !== visitDate
    ) {

      this.errorMessage =
        'Expected arrival and departure must be on the same date.';

      return null;
    }

    return {
      registrationType:
        value.registrationType,

      visitorType:
        value.visitorType,

      firstName:
        value.firstName.trim(),

      lastName:
        value.lastName.trim(),

      email:
        value.email.trim().toLowerCase(),

      mobileNumber:
        value.mobileNumber.trim(),

      companyName:
        value.companyName.trim(),

      purpose:
        value.purpose.trim(),

      hostId:
        value.hostId,

      visitDate,

      expectedArrivalTime:
        this.formatTime(arrival),

      expectedDepartureTime:
        this.formatTime(departure),

      remarks:
        value.remarks?.trim() || null,

      proofType:
        value.proofType || null,

      proofNumber:
        value.proofNumber?.trim() || null
    };
  }

  // --------------------------------------------------------------------------
  // Error handling
  // --------------------------------------------------------------------------

  private handleRegistrationError(error: any): void {

    if (error?.status === 409) {

      this.errorMessage =
        error?.error?.message ??
        'A visitor with this email or mobile number already exists.';

      return;
    }

    if (error?.status === 400) {

      this.errorMessage =
        error?.error?.message ??
        'Please check the entered details.';

      return;
    }

    this.errorMessage =
      error?.error?.message ??
      'Unable to register the visit. Please try again.';
  }

  // --------------------------------------------------------------------------
  // ID proof
  // --------------------------------------------------------------------------

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];

    if (file.size > maxSize) {

      this.errorMessage =
        'File size must not exceed 5 MB.';

      input.value = '';

      return;
    }

    if (!allowedTypes.includes(file.type)) {

      this.errorMessage =
        'Only JPG, PNG and PDF files are allowed.';

      input.value = '';

      return;
    }

    this.registrationForm.patchValue({
      proofImage: file
    });

    this.errorMessage = '';
  }

  getSelectedFileName(): string {

    const file =
      this.registrationForm.get('proofImage')?.value;

    return file instanceof File
      ? file.name
      : '';
  }

  // --------------------------------------------------------------------------
  // Form helpers
  // --------------------------------------------------------------------------

  isInvalid(controlName: string): boolean {

    const control =
      this.registrationForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || control.dirty)
    );
  }

  // --------------------------------------------------------------------------
  // Reset
  // --------------------------------------------------------------------------

  resetForm(): void {

    this.registrationForm.reset();

    this.createdVisit = null;

    this.registrationSuccess = false;

    this.isSubmitting = false;

    this.clearMessages();

    this.minDateTime =
      this.getCurrentDateTime();
  }

  createAnotherVisit(): void {

    this.resetForm();
  }

  // --------------------------------------------------------------------------
  // Messages
  // --------------------------------------------------------------------------

  private clearMessages(): void {

    this.errorMessage = '';
    this.successMessage = '';
  }

  // --------------------------------------------------------------------------
  // Date / time helpers
  // --------------------------------------------------------------------------

  private parseDateTime(
    value: string
  ): Date | null {

    if (!value) {
      return null;
    }

    const date =
      new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  private formatDate(date: Date): string {

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1)
        .padStart(2, '0');

    const day =
      String(date.getDate())
        .padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private formatTime(date: Date): string {

    const hours =
      String(date.getHours())
        .padStart(2, '0');

    const minutes =
      String(date.getMinutes())
        .padStart(2, '0');

    const seconds =
      String(date.getSeconds())
        .padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  private getCurrentDateTime(): string {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(now.getMonth() + 1)
        .padStart(2, '0');

    const day =
      String(now.getDate())
        .padStart(2, '0');

    const hours =
      String(now.getHours())
        .padStart(2, '0');

    const minutes =
      String(now.getMinutes())
        .padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}