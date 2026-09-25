import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Subscription } from 'rxjs';

import { Employee } from '../../../core/models/employee/employee.model';

import {
  ProofType,
  RegistrationRequest,
  RegistrationResponse,
  RegistrationType,
  VisitorType,
  Nationality
} from '../../../core/models/registration/registration.model';

import { EmployeeService } from '../../../core/services/employee/employee.service';
import { VisitService } from '../../../core/services/visit/visit.service';

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
export class VisitorRegistrationComponent implements OnInit, OnDestroy {

  // --------------------------------------------------------------------------
  // Services
  // --------------------------------------------------------------------------

  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly visitService = inject(VisitService);
  private readonly cdr = inject(ChangeDetectorRef);

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
    

    // ------------------------------------------------------------------------
    // Nationality & ID Proof
    // ------------------------------------------------------------------------

    nationality: this.fb.control<string | null>(
      '',
      Validators.required
    ),

    aadhaarNumber: this.fb.control<string | null>(null),

    panNumber: this.fb.control<string | null>(null),

    passportNumber: this.fb.control<string | null>(null),

    validity: this.fb.control<string | null>(null),

    // ------------------------------------------------------------------------
    // Documents
    // ------------------------------------------------------------------------

    documents: this.fb.control<File[]>([])
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

  private currentDateTimer?: ReturnType<typeof setInterval>;

  private readonly subscriptions = new Subscription();

  // --------------------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------------------

  // ngOnInit(): void {
  //   this.loadEmployees();

  //   /*
  //    * Keep the displayed date/time current.
  //    */
  //   this.currentDateTimer = setInterval(() => {
  //     this.currentDate = new Date();
  //     this.minDateTime = this.getCurrentDateTime();

  //     this.cdr.detectChanges();
  //   }, 1000);
  // }

 ngOnInit(): void {
  this.loadEmployees();

  const currentTime = this.getCurrentDateTime();

  this.registrationForm.patchValue({
    expectedArrivalAt: currentTime,
    expectedDepartureAt: currentTime
  });

  this.currentDateTimer = setInterval(() => {

    const now = this.getCurrentDateTime();

    this.currentDate = new Date();
    this.minDateTime = now;

    const arrivalControl =
      this.registrationForm.get('expectedArrivalAt');

    const departureControl =
      this.registrationForm.get('expectedDepartureAt');

    if (!arrivalControl?.dirty) {
      arrivalControl?.setValue(now, {
        emitEvent: false
      });
    }

    if (!departureControl?.dirty) {
      departureControl?.setValue(now, {
        emitEvent: false
      });
    }

    this.cdr.detectChanges();

  }, 1000);
}

  ngOnDestroy(): void {
    if (this.currentDateTimer) {
      clearInterval(this.currentDateTimer);
    }

    this.subscriptions.unsubscribe();
  }

  // --------------------------------------------------------------------------
  // Employee
  // --------------------------------------------------------------------------

  private loadEmployees(): void {
    this.isLoadingEmployees = true;
    this.errorMessage = '';

    const subscription = this.employeeService.getEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees.filter(
          employee => employee.status === 'ACTIVE'
        );

        this.isLoadingEmployees = false;

        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error(
          'Failed to load employees:',
          error
        );

        this.isLoadingEmployees = false;

        this.errorMessage =
          error?.error?.message ??
          'Unable to load employees.';

        this.cdr.detectChanges();
      }
    });

    this.subscriptions.add(subscription);
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
    return `${employee.id} — ${employee.firstName} ${employee.lastName}`;
  }

  // --------------------------------------------------------------------------
  // Nationality / Proof
  // --------------------------------------------------------------------------

  onNationalityChange(): void {
    const nationality =
      this.registrationForm.get('nationality')?.value;

    const aadhaarControl =
      this.registrationForm.get('aadhaarNumber');

    const panControl =
      this.registrationForm.get('panNumber');

    const passportControl =
      this.registrationForm.get('passportNumber');

    // Clear existing validators
    aadhaarControl?.clearValidators();
    panControl?.clearValidators();
    passportControl?.clearValidators();

    // Clear previous values
    aadhaarControl?.reset(null);
    panControl?.reset(null);
    passportControl?.reset(null);

    if (nationality === 'DOMESTIC') {

      aadhaarControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{12}$/)
      ]);

      panControl?.setValidators([
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
      ]);

    } else if (nationality === 'INTERNATIONAL') {

      passportControl?.setValidators([
        Validators.required,
        Validators.maxLength(20)
      ]);
    }

    aadhaarControl?.updateValueAndValidity();
    panControl?.updateValueAndValidity();
    passportControl?.updateValueAndValidity();
  }

  // --------------------------------------------------------------------------
  // Submit
  // --------------------------------------------------------------------------

  submitRegistration(): void {
    this.clearMessages();

    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();

      this.errorMessage =
        'Please complete all required fields.';

      return;
    }

    const request =
      this.buildRegistrationRequest();

    if (!request) {
      return;
    }

    this.isSubmitting = true;

    const subscription =
      this.visitService.register(request).subscribe({

        next: (response: RegistrationResponse) => {

          console.log(
            'Registration successful:',
            response
          );

          this.createdVisit = response;

          this.registrationSuccess = true;

          this.isSubmitting = false;

          this.successMessage =
            response.message ||
            'Visit registered successfully.';

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

        error: (error: any) => {

          console.error(
            'Visit registration failed:',
            error
          );

          this.isSubmitting = false;

          this.handleRegistrationError(error);

          this.cdr.detectChanges();
        }
      });

    this.subscriptions.add(subscription);
  }

  // --------------------------------------------------------------------------
  // Documents
  // --------------------------------------------------------------------------

  onDocumentsSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];

    const newFiles = Array.from(files);

    // ------------------------------------------------------------------------
    // Validate files
    // ------------------------------------------------------------------------

    for (const file of newFiles) {

      if (!allowedTypes.includes(file.type)) {

        this.errorMessage =
          `"${file.name}" is not a supported file type.`;

        input.value = '';

        return;
      }

      if (file.size > maxSize) {

        this.errorMessage =
          `"${file.name}" exceeds the 5 MB limit.`;

        input.value = '';

        return;
      }
    }

    // ------------------------------------------------------------------------
    // Get existing files
    // ------------------------------------------------------------------------

    const existingFiles =
      this.getSelectedDocuments();

    // ------------------------------------------------------------------------
    // Append new files
    // ------------------------------------------------------------------------

    const updatedFiles = [
      ...existingFiles,
      ...newFiles
    ];

    this.registrationForm.patchValue({
      documents: updatedFiles
    });

    this.errorMessage = '';

    // Allow same file to be selected again
    input.value = '';
  }

  getSelectedDocuments(): File[] {

    const files =
      this.registrationForm.get('documents')?.value;

    return Array.isArray(files)
      ? files
      : [];
  }

  removeDocument(index: number): void {

    const files =
      this.getSelectedDocuments();

    if (
      index < 0 ||
      index >= files.length
    ) {
      return;
    }

    const updatedFiles =
      files.filter(
        (_, fileIndex) => fileIndex !== index
      );

    this.registrationForm.patchValue({
      documents: updatedFiles
    });

    this.errorMessage = '';
  }

  getSelectedDocumentNames(): string {

    const files =
      this.getSelectedDocuments();

    if (files.length === 0) {
      return '';
    }

    if (files.length === 1) {
      return files[0].name;
    }

    return `${files.length} documents selected`;
  }

  formatFileSize(size: number): string {

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  // --------------------------------------------------------------------------
  // Build backend request
  // --------------------------------------------------------------------------

  private buildRegistrationRequest():
    RegistrationRequest | null {

    const value =
      this.registrationForm.getRawValue();

    const arrival =
      this.parseDateTime(
        value.expectedArrivalAt
      );

    const departure =
      this.parseDateTime(
        value.expectedDepartureAt
      );

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

    // ------------------------------------------------------------------------
    // Convert nationality-specific proof fields into backend fields
    // ------------------------------------------------------------------------

    let proofType: ProofType | null = null;
    let proofNumber: string | null = null;

    const nationality =
      value.nationality as Nationality | null;

    if (nationality === 'DOMESTIC') {

      /*
       * For domestic visitors, the form requires both
       * Aadhaar and PAN.
       *
       * RegistrationRequest supports only one proofType/proofNumber,
       * so Aadhaar is used as the primary proof.
       */

      if (value.aadhaarNumber) {
        proofType = 'AADHAAR';
        proofNumber =
          String(value.aadhaarNumber).trim();
      }

    } else if (nationality === 'INTERNATIONAL') {

      if (value.passportNumber) {
        proofType = 'PASSPORT';
        proofNumber =
          String(value.passportNumber).trim();
      }
    }

    // ------------------------------------------------------------------------
    // Create request
    // ------------------------------------------------------------------------

    const request: RegistrationRequest = {

      registrationType:
        value.registrationType as RegistrationType,

      visitorType:
        value.visitorType as VisitorType,

      firstName:
        String(value.firstName ?? '').trim(),

      lastName:
        String(value.lastName ?? '').trim(),

      email:
        String(value.email ?? '')
          .trim()
          .toLowerCase(),

      mobileNumber:
        String(value.mobileNumber ?? '').trim(),

      companyName:
        String(value.companyName ?? '').trim(),

      purpose:
        String(value.purpose ?? '').trim(),

      hostId:
        String(value.hostId ?? '').trim(),

      visitDate,

      expectedArrivalTime:
        this.formatTime(arrival),

      expectedDepartureTime:
        this.formatTime(departure),

      remarks:
        value.remarks
          ? String(value.remarks).trim()
          : null,

      nationality:
    nationality as Nationality,
      aadharNumber: value.aadhaarNumber
    ? String(value.aadhaarNumber).trim()
    : null,

  panNumber: value.panNumber
    ? String(value.panNumber).trim()
    : null,

  passportNumber: value.passportNumber
    ? String(value.passportNumber).trim()
    : null,


  validity: value.validity
  ? String(value.validity)
  : null,
    };

    
    return request;
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

    this.registrationForm.patchValue({
      documents: []
    });

    this.createdVisit = null;

    this.registrationSuccess = false;

    this.isSubmitting = false;

    this.clearMessages();

    this.minDateTime =
      this.getCurrentDateTime();

    this.onNationalityChange();
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