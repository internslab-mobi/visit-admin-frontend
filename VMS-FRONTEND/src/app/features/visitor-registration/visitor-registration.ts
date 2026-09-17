

import { Component, OnInit, inject,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  RegistrationRequest,
  RegistrationResponse
} from '../../core/services/visit/visit.service';

import { Visitor } from '../../core/models/visitor/visitor.model';
import { VisitorType } from '../../core/models/visitor/visitor-type.model';
import { RegistrationType } from '../../core/models/visitor/registration-type.model';
import { Employee } from '../../core/models/employee/employee.model';
import { Department } from '../../core/models/department/department.model';

import { VisitService } from '../../core/services/visit/visit.service';
import { EmployeeService } from '../../core/services/employee/employee.service';
import { DepartmentService } from '../../core/services/department/department.service';
import { MasterDataService } from '../../core/services/masterdata/master-data.service';

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

  private readonly visitService = inject(VisitService);
  private readonly employeeService = inject(EmployeeService);
  private readonly departmentService = inject(DepartmentService);
  private readonly masterDataService = inject(MasterDataService);
private readonly cdr=inject(ChangeDetectorRef);
  currentDate = new Date();
  minDateTime = this.formatDateTimeLocal(new Date());

  /*
   * ============================================================
   * FORMS
   * ============================================================
   */

  searchForm!: FormGroup;
  visitorForm!: FormGroup;
  visitForm!: FormGroup;

  /*
   * ============================================================
   * MASTER DATA
   * ============================================================
   */

  visitorTypes: VisitorType[] = [];

  registrationTypes: RegistrationType[] = [];

  employees: Employee[] = [];

  departments: Department[] = [];

  purposes: {
    id: number;
    name: string;
    isActive: boolean;
  }[] = [];

  
  existingVisitor: Visitor | null = null;

  createdVisitor: Visitor | null = null;

  /*
   * ============================================================
   * UI STATE
   * ============================================================
   */

  isSearching = false;

  searchCompleted = false;

  visitorNotFound = false;

  showCreateVisitorForm = false;

  showVisitForm = false;

  isCreatingVisitor = false;

  isCreatingVisit = false;

  registrationSuccess = false;

  createdVisit: RegistrationResponse | null = null;

  errorMessage = '';

  successMessage = '';

  /*
   * ============================================================
   * CONSTRUCTOR
   * ============================================================
   */

  constructor() {
    this.initializeForms();
  }

  /*
   * ============================================================
   * INIT
   * ============================================================
   */

  ngOnInit(): void {
    this.loadMasterData();
  }

  /*
   * ============================================================
   * FORM INITIALIZATION
   * ============================================================
   */

  private initializeForms(): void {

    /*
     * Email search field.
     */

    this.searchForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(254)
        ]
      ]
    });

    /*
     * Visitor profile.
     */

    this.visitorForm = this.fb.group({

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
          Validators.minLength(1),
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
          Validators.pattern('^[6-9][0-9]{9}$')
        ]
      ],

      companyName: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ]
    });

    /*
     * Visit details.
     */

    this.visitForm = this.fb.group({

      visitorType: [
        '',
        Validators.required
      ],

      registrationType: [
        '',
        Validators.required
      ],

      purpose: [
        '',
        [
          Validators.required,
          Validators.maxLength(500)
        ]
      ],

      hostId: [
        null,
        Validators.required
      ],

      /*
       * Department is automatically populated from the
       * selected employee.
       */

      departmentId: [
        {
          value: null,
          disabled: true
        }
      ],

      expectedArrivalAt: [
        '',
        Validators.required
      ],

      /*
       * Backend requires expectedDepartureTime.
       */

      expectedDepartureAt: [
        '',
        Validators.required
      ],

      remarks: [
        '',
        Validators.maxLength(1000)
      ],

      /*
       * ID proof is optional.
       */

      proofType: [
        ''
      ],

      proofNumber: [
        '',
        Validators.maxLength(100)
      ],

     

      proofImage: [
        null
      ]
    });
  }

  /*
   * ============================================================
   * MASTER DATA
   * ============================================================
   */

  private loadMasterData(): void {

    /*
     * Visitor types
     */

    this.masterDataService
      .getVisitorTypes()
      .subscribe({
        next: (types) => {
          this.visitorTypes = types;
        },

        error: (error) => {
          console.error(
            'Unable to load visitor types:',
            error
          );

          this.errorMessage =
            'Unable to load visitor types.';
        }
      });

    /*
     * Registration types
     */

    this.masterDataService
      .getRegistrationTypes()
      .subscribe({
        next: (types) => {
          this.registrationTypes = types;
        },

        error: (error) => {
          console.error(
            'Unable to load registration types:',
            error
          );

          this.errorMessage =
            'Unable to load registration types.';
        }
      });

    /*
     * Purposes
     */

    this.masterDataService
      .getPurposes()
      .subscribe({
        next: (purposes) => {
          this.purposes = purposes;
        },

        error: (error) => {
          console.error(
            'Unable to load purposes:',
            error
          );

          this.errorMessage =
            'Unable to load visit purposes.';
        }
      });

    /*
     * Employees
     */

    this.employeeService
      .getEmployees()
      .subscribe({
        next: (employees) => {
          this.employees = employees;
        },

        error: (error) => {
          console.error(
            'Unable to load employees:',
            error
          );

          this.errorMessage =
            'Unable to load employees.';
        }
      });

    /*
     * Departments
     */

    this.departmentService
      .getDepartments()
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },

        error: (error) => {
          console.error(
            'Unable to load departments:',
            error
          );

          this.errorMessage =
            'Unable to load departments.';
        }
      });
  }


  searchVisitor(): void {

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const email =
      this.searchForm
        .get('email')
        ?.value
        ?.trim()
        ?.toLowerCase();

    if (!email) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Always clear the previous visitor state.
     *
     * This prevents the next/new visitor from accidentally
     * inheriting existingVisitor from the previous registration.
     */

    this.existingVisitor = null;
    this.createdVisitor = null;

    this.isSearching = true;

    this.searchCompleted = false;

    this.visitorNotFound = false;

    this.registrationSuccess = false;

    this.createdVisit = null;

    this.errorMessage = '';

    this.successMessage = '';

    /*
     * Reset only the visitor form.
     *
     * Do not reset visitForm here.
     */

    this.visitorForm.reset();

    /*
     * Put the email entered by the user into visitorForm.
     */

    this.visitorForm.patchValue({
      email: email
    });

    /*
     * No backend search is performed here because the current
     * backend has no visitor lookup endpoint.
     */

    this.isSearching = false;

    this.searchCompleted = true;

    /*
     * Show the visitor and visit sections.
     */

    this.showCreateVisitorForm = true;

    this.showVisitForm = true;
  }

  /*
   * ============================================================
   * CREATE VISITOR
   * ============================================================
   *
   * Visitor creation is NOT performed separately.
   *
   * The final registration goes through POST /api/visits.
   *
   * This method is retained only because the existing HTML
   * may reference it.
   */

  createVisitor(): void {

    this.errorMessage =
      'Visitor profiles are created automatically when the visit is registered.';
  }

  /*
   * ============================================================
   * SUBMIT REGISTRATION
   * ============================================================
   */

  submitRegistration(): void {

    this.errorMessage = '';

    this.successMessage = '';

    /*
     * Validate visitor details.
     */

    if (this.visitorForm.invalid) {

      this.visitorForm.markAllAsTouched();

      this.errorMessage =
        'Please complete the visitor details before submitting.';

      return;
    }

    /*
     * Validate visit details.
     */

    if (this.visitForm.invalid) {

      this.visitForm.markAllAsTouched();

      this.errorMessage =
        'Please complete the visit details before submitting.';

      return;
    }

    /*
     * Proceed with registration.
     */

    this.createVisit();
  }

  /*
   * ============================================================
   * CREATE VISIT
   * ============================================================
   */

  createVisit(): void {

    /*
     * Validate visitor details.
     */

    if (this.visitorForm.invalid) {

      this.visitorForm.markAllAsTouched();

      this.errorMessage =
        'Please complete the visitor details before submitting.';

      return;
    }

    /*
     * Validate visit details.
     */

    if (this.visitForm.invalid) {

      this.visitForm.markAllAsTouched();

      this.errorMessage =
        'Please complete the visit details before submitting.';

      return;
    }

    /*
     * getRawValue() is important because departmentId is
     * disabled.
     */

    const visitorValue =
      this.visitorForm.getRawValue();

    const visitValue =
      this.visitForm.getRawValue();

    /*
     * Get arrival/departure values.
     */

    const arrivalDateTime =
      visitValue.expectedArrivalAt;

    const departureDateTime =
      visitValue.expectedDepartureAt;

    if (!arrivalDateTime || !departureDateTime) {

      this.errorMessage =
        'Expected arrival and departure time are required.';

      return;
    }

    /*
     * Convert datetime-local values into Date objects.
     */

    const arrival =
      new Date(arrivalDateTime);

    const departure =
      new Date(departureDateTime);

    /*
     * Validate dates.
     */

    if (
      Number.isNaN(arrival.getTime()) ||
      Number.isNaN(departure.getTime())
    ) {

      this.errorMessage =
        'Please enter valid arrival and departure dates and times.';

      return;
    }

    /*
     * The backend RegistrationRequest contains one visitDate.
     *
     * Therefore arrival and departure must be on the same date.
     */

    const arrivalDate =
      this.formatDate(arrival);

    const departureDate =
      this.formatDate(departure);

    if (arrivalDate !== departureDate) {

      this.errorMessage =
        'Expected arrival and departure must be on the same date.';

      return;
    }

    /*
     * Departure must be after arrival.
     */

    if (departure.getTime() <= arrival.getTime()) {

      this.errorMessage =
        'Expected departure time must be after expected arrival time.';

      return;
    }

    /*
     * Start loading state.
     */

    this.isCreatingVisit = true;

    this.errorMessage = '';

    this.successMessage = '';

    /*
     * Build backend RegistrationRequest.
     */

    const visitData: RegistrationRequest = {

      registrationType:
        this.toBackendEnum(
          visitValue.registrationType
        ),

      visitorType:
        this.toBackendEnum(
          visitValue.visitorType
        ),

      firstName:
        visitorValue.firstName
          ?.trim(),

      lastName:
        visitorValue.lastName
          ?.trim(),

      email:
        visitorValue.email
          ?.trim()
          ?.toLowerCase(),

      mobileNumber:
        visitorValue.mobileNumber
          ?.trim(),

      companyName:
        visitorValue.companyName
          ?.trim(),

      purpose:
        visitValue.purpose
          ?.trim(),

      hostId:
        Number(visitValue.hostId),

      visitDate:
        arrivalDate,

      expectedArrivalTime:
        this.formatTime(arrival),

      expectedDepartureTime:
        this.formatTime(departure),

      remarks:
        visitValue.remarks
          ?.trim() || null,

      /*
       * Backend ProofType accepts:
       *
       * OTHER
       * DRIVING_LICENSE
       * PASSPORT
       * AADHAAR
       */

      proofType:
        visitValue.proofType
          ? this.toBackendEnum(
              visitValue.proofType
            )
          : null,

      proofNumber:
        visitValue.proofNumber
          ?.trim() || null
    };

    console.log(
      'Sending registration request:',
      visitData
    );

    /*
     * IMPORTANT:
     *
     * Only /api/visits is called.
     *
     * Existing visitor:
     *     backend reuses visitor
     *
     * New visitor:
     *     backend creates visitor
     *
     * Then backend creates the visit.
     */

    this.visitService
      .createVisit(visitData)
      .subscribe({

        /*
         * ======================================================
         * SUCCESS
         * ======================================================
         */

        next: (visit: RegistrationResponse) => {

          console.log(
            'Visit registration successful:',
            visit
          );

          /*
           * Stop loading immediately.
           */

          this.isCreatingVisit = false;

          /*
           * Store the COMPLETE backend response.
           *
           * This contains:
           *
           * firstName
           * lastName
           * email
           * companyName
           * visitReference
           * expectedArrivalAt
           * expectedDepartureAt
           * status
           * etc.
           */

          this.createdVisit = visit;

          /*
           * IMPORTANT:
           *
           * Set success state after createdVisit.
           *
           * The HTML uses:
           *
           * registrationSuccess && createdVisit
           */

          this.registrationSuccess = true;

          /*
           * Hide registration form.
           */

          this.showVisitForm = false;

          this.showCreateVisitorForm = false;

          /*
           * Clear old visitor objects.
           *
           * The success page should use createdVisit instead.
           */

          this.existingVisitor = null;

          this.createdVisitor = null;

          /*
           * Success message.
           */

          this.successMessage =
            visit.message ||
            'Visit registered successfully.';

          this.errorMessage = '';
          this.cdr.detectChanges();
        },

        /*
         * ======================================================
         * ERROR
         * ======================================================
         */

        error: (error) => {

          console.error(
            'Visit registration failed:',
            error
          );

          console.error(
            'Backend response:',
            error?.error
          );

          console.error(
            'Backend message:',
            error?.error?.message
          );

          /*
           * Stop loading.
           */

          this.isCreatingVisit = false;

          /*
           * 409 - duplicate/conflict
           */

          if (error?.status === 409) {

            this.errorMessage =
              error?.error?.message ||
              'A visitor with this email or mobile number already exists.';

            return;
          }

          /*
           * 400 - validation / JSON parsing error
           */

          if (error?.status === 400) {

            this.errorMessage =
              error?.error?.message ||
              'Please check the visitor and visit details and try again.';

            return;
          }

          /*
           * Other errors.
           */

          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to create visit. Please try again.';
        }
      });
  }

  /*
   * ============================================================
   * EMPLOYEE → DEPARTMENT
   * ============================================================
   */

  onEmployeeChange(): void {

    const employeeId =
      Number(
        this.visitForm
          .get('hostId')
          ?.value
      );

    if (!employeeId) {

      this.visitForm.patchValue({
        departmentId: null
      });

      return;
    }

    const employee =
      this.employees.find(
        employee =>
          employee.id === employeeId
      );

    if (!employee) {
      return;
    }

    this.visitForm.patchValue({
      departmentId:
        employee.departmentId
    });
  }

  /*
   * ============================================================
   * ID PROOF FILE
   * ============================================================
   */

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const file =
      input.files[0];

    const maxSize =
      5 * 1024 * 1024;

    /*
     * Maximum 5 MB.
     */

    if (file.size > maxSize) {

      this.errorMessage =
        'File size must not exceed 5 MB.';

      input.value = '';

      return;
    }

    /*
     * Allowed file types.
     */

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {

      this.errorMessage =
        'Only JPG, PNG and PDF files are allowed.';

      input.value = '';

      return;
    }

    

    this.visitForm.patchValue({
      proofImage: file
    });

    this.errorMessage = '';
  }

  /*
   * ============================================================
   * GET SELECTED FILE NAME
   * ============================================================
   */

  getSelectedFileName(): string {

    const file =
      this.visitForm
        .get('proofImage')
        ?.value;

    return file
      ? file.name
      : '';
  }

  /*
   * ============================================================
   * VALIDATION HELPER
   * ============================================================
   */

  isInvalid(
    form: FormGroup,
    controlName: string
  ): boolean {

    const control =
      form.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.dirty ||
        control.touched
      )
    );
  }

  /*
   * ============================================================
   * EMPLOYEE DISPLAY
   * ============================================================
   */

  getEmployeeDisplayName(
    employee: Employee
  ): string {

    return `${employee.employeeId} — ${employee.fullName}`;
  }

  /*
   * ============================================================
   * DEPARTMENT DISPLAY
   * ============================================================
   */

  getDepartmentName(
    departmentId: number
  ): string {

    const department =
      this.departments.find(
        department =>
          department.id === departmentId
      );

    return department?.name || '';
  }

  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  resetForm(): void {

    this.searchForm.reset();

    this.visitorForm.reset();

    this.visitForm.reset();

    /*
     * Reset visitor state.
     */

    this.existingVisitor = null;

    this.createdVisitor = null;

    /*
     * Reset visit response.
     */

    this.createdVisit = null;

    /*
     * Reset UI state.
     */

    this.searchCompleted = false;

    this.visitorNotFound = false;

    this.showCreateVisitorForm = false;

    this.showVisitForm = false;

    this.registrationSuccess = false;

    this.isSearching = false;

    this.isCreatingVisitor = false;

    this.isCreatingVisit = false;

    this.errorMessage = '';

    this.successMessage = '';
  }

  /*
   * ============================================================
   * CREATE ANOTHER VISIT
   * ============================================================
   */

  createAnotherVisit(): void {

    /*
     * Remove previous success response.
     */

    this.createdVisit = null;

    this.registrationSuccess = false;

    /*
     * Clear visit details.
     *
     * Visitor details remain available so the same visitor
     * can register another visit.
     */

    this.visitForm.reset();

    /*
     * Show visit form again.
     */

    this.showVisitForm = true;

    this.showCreateVisitorForm = true;

    this.successMessage = '';

    this.errorMessage = '';
  }

  /*
   * ============================================================
   * ENUM CONVERSION
   * ============================================================
   *
   * Examples:
   *
   * Visitor
   *      → VISITOR
   *
   * Pre-Registration
   *      → PRE_REGISTRATION
   *
   * Driving License
   *      → DRIVING_LICENSE
   */

  private toBackendEnum(
    value: string
  ): string {

    return value
      ?.trim()
      .toUpperCase()
      .replace(/[\s-]+/g, '_');
  }

  /*
   * ============================================================
   * FORMAT DATE
   * ============================================================
   */

  private formatDate(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /*
   * ============================================================
   * FORMAT TIME
   * ============================================================
   */

  private formatTime(
    date: Date
  ): string {

    const hours =
      String(
        date.getHours()
      ).padStart(2, '0');

    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, '0');

    return `${hours}:${minutes}:00`;
  }

  private formatDateTimeLocal(date: Date): string {

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  const hours = String(
    date.getHours()
  ).padStart(2, '0');

  const minutes = String(
    date.getMinutes()
  ).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
}