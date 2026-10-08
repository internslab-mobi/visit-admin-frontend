
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
import { ProofDocumentService } from '../../../core/services/document/proof-document.service';
import { VendorService, VendorResponse } from '../../../core/services/vendor/vendor.service';
import {
  VisitorService,
  VisitorDocument,
  VisitorEditResponse,
  VisitorResponse
} from '../../../core/services/visitor/visitor.service';


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

  
  // Services
  

  private readonly fb = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly visitService = inject(VisitService);
  private readonly proofDocumentService = inject(ProofDocumentService);
  private readonly vendorService = inject(VendorService);
  private readonly visitorService = inject(VisitorService);
  private readonly cdr = inject(ChangeDetectorRef);


  
  // Backend data
  

  employees: Employee[] = [];
  vendors: VendorResponse[] = [];
  visitors: VisitorResponse[] = [];
  existingVendorDocuments: VisitorDocument[] = [];
  selectedVendorId: string | null = null;
  selectedVisitorId: string | null = null;
  isExistingVendor = false;
  isExistingVisitor = false;
  isCreatingNewVendor = false;
  isLoadingVendors = false;
  isLoadingVisitors = false;
  isLoadingVendorDetails = false;


  
  // Reactive form
  

  registrationForm: FormGroup = this.fb.group({

    visitorType: [
      '',
      Validators.required
    ],

    registrationType: [
      '',
      Validators.required
    ],

    vendorId: [''],

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

    // ------------------------------------------------------------------------
    // Documents
    // ------------------------------------------------------------------------

    documents: this.fb.control<File[]>([])
  });


  
  // UI state
  

  isLoadingEmployees = false;
  employeeSearchTerm = '';
  filteredEmployees: Employee[] = [];
  isEmployeeDropdownOpen = false;
  private readonly maxEmployeeSearchResults = 50;
  isSubmitting = false;

  registrationSuccess = false;

  createdVisit: RegistrationResponse | null = null;

  errorMessage = '';
  successMessage = '';

  currentDate = new Date();

  minDateTime = this.getCurrentDateTime();

  private currentDateTimer?: ReturnType<typeof setInterval>;

  private readonly subscriptions = new Subscription();


  
  // Lifecycle
  

  ngOnInit(): void {

    this.loadEmployees();
    this.loadVendors();
    this.loadVisitors();

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


  
  // Employee
  

  private loadEmployees(): void {

    this.isLoadingEmployees = true;
    this.errorMessage = '';


    const subscription =
      this.employeeService.getEmployees().subscribe({

        next: (employees: Employee[]) => {

          this.employees =
            employees.filter(
              employee => employee.status === 'ACTIVE'
            );

          this.employeeSearchTerm = '';
          this.filteredEmployees = this.employees.slice(
            0,
            this.maxEmployeeSearchResults
          );
          this.isEmployeeDropdownOpen = false;

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


  onEmployeeSearchInput(): void {

    const term =
      this.employeeSearchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredEmployees = this.employees.slice(
        0,
        this.maxEmployeeSearchResults
      );
      this.isEmployeeDropdownOpen = true;
      return;
    }

    this.filteredEmployees = this.employees
      .filter(employee => {
        const employeeId = String(
          (employee as any).employeeCode ??
          employee.id ??
          ''
        ).toLowerCase();

        const firstName = String(employee.firstName ?? '').toLowerCase();
        const lastName = String(employee.lastName ?? '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.trim();

        return (
          employeeId.includes(term) ||
          firstName.includes(term) ||
          lastName.includes(term) ||
          fullName.includes(term)
        );
      })
      .slice(0, this.maxEmployeeSearchResults);

    this.isEmployeeDropdownOpen = true;
  }

  openEmployeeDropdown(): void {
    if (this.isLoadingEmployees) {
      return;
    }

    this.onEmployeeSearchInput();
    this.isEmployeeDropdownOpen = true;
  }

  closeEmployeeDropdown(): void {
    setTimeout(() => {
      this.isEmployeeDropdownOpen = false;
      this.cdr.detectChanges();
    }, 150);
  }

  selectEmployee(employee: Employee): void {
    this.employeeSearchTerm = this.getEmployeeDisplayName(employee);
    this.isEmployeeDropdownOpen = false;

    this.registrationForm.patchValue({
      hostId: employee.id
    });

    this.setDepartmentFromEmployee(employee);
    this.registrationForm.get('hostId')?.markAsTouched();
  }

  onEmployeeChange(): void {
    const hostId = this.registrationForm.get('hostId')?.value;

    const employee = this.employees.find(
      item => String(item.id) === String(hostId)
    );

    if (!employee) {
      this.registrationForm.patchValue({
        departmentName: ''
      });
      return;
    }

    this.employeeSearchTerm = this.getEmployeeDisplayName(employee);
    this.setDepartmentFromEmployee(employee);
  }

  private setDepartmentFromEmployee(employee: Employee): void {
    const departmentName =
      (employee as any).department?.departmentName ??
      (employee as any).department?.name ??
      (employee as any).departmentName ??
      '';

    this.registrationForm.patchValue({
      departmentName
    });

    this.cdr.detectChanges();
  }

  getEmployeeDisplayName(employee: Employee): string {
    const employeeId = String(
      (employee as any).employeeCode ??
      employee.id ??
      ''
    );

    const name = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim();

    return `${employeeId} — ${name}`;
  }

  getEmployeeSearchResultText(): string {
    const count = this.filteredEmployees.length;

    if (count === 0) {
      return this.employeeSearchTerm.trim()
        ? 'No matching employees found.'
        : 'No active employees found.';
    }

    return count === this.maxEmployeeSearchResults
      ? `Showing first ${this.maxEmployeeSearchResults} matches. Refine your search.`
      : `${count} employee${count === 1 ? '' : 's'} found.`;
  }


  

  // Vendor / Existing Visitor

  private loadVendors(): void {

    this.isLoadingVendors = true;

    const subscription =
      this.vendorService.getVendors().subscribe({

        next: (vendors: VendorResponse[]) => {
          this.vendors = vendors;
          this.isLoadingVendors = false;
          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Failed to load vendors:', error);
          this.vendors = [];
          this.isLoadingVendors = false;
          this.errorMessage =
            error?.error?.message ?? 'Unable to load vendors.';
          this.cdr.detectChanges();
        }
      });

    this.subscriptions.add(subscription);
  }

  private loadVisitors(): void {

    this.isLoadingVisitors = true;

    const subscription =
      this.visitorService.getVisitors().subscribe({

        next: (visitors: VisitorResponse[]) => {
          this.visitors = visitors;
          this.isLoadingVisitors = false;
          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Failed to load visitors:', error);
          this.visitors = [];
          this.isLoadingVisitors = false;
        }
      });

    this.subscriptions.add(subscription);
  }

  getVendorDisplayName(vendor: VendorResponse): string {
    const name = `${vendor.firstName} ${vendor.lastName}`.trim();
    const company = vendor.companyName?.trim();

    return company
      ? `${name} — ${vendor.id} (${company})`
      : `${name} — ${vendor.id}`;
  }

  onVisitorTypeChange(): void {

    const visitorType =
      this.registrationForm.get('visitorType')?.value;

    this.clearVendorSelection();

    if (visitorType === 'VENDOR') {
      this.setPersonalFieldsReadonly(true);
      this.setNationalityReadonly(true);
    } else {
      this.setPersonalFieldsReadonly(false);
      this.setNationalityReadonly(false);
    }

    this.updateCompanyValidator();
    this.updateVendorSelectionValidator();
  }

  onVendorChange(): void {

    const vendorId =
      this.registrationForm.get('vendorId')?.value;

    if (!vendorId) {
      this.clearExistingProfile();
      this.setPersonalFieldsReadonly(true);
      this.setNationalityReadonly(true);
      this.updateCompanyValidator();
      this.updateVendorSelectionValidator();
      return;
    }

    const vendor =
      this.vendors.find(item => item.id === vendorId);

    if (!vendor) {
      return;
    }

    this.selectedVendorId = vendor.id;
    this.selectedVisitorId = vendor.visitorId;
    this.isExistingVendor = true;
    this.isExistingVisitor = false;
    this.isCreatingNewVendor = false;
    this.isLoadingVendorDetails = true;
    this.existingVendorDocuments = [];

    this.registrationForm.patchValue({
      documents: [],
      firstName: vendor.firstName,
      lastName: vendor.lastName,
      email: vendor.email,
      mobileNumber: vendor.mobileNumber,
      companyName: vendor.companyName ?? ''
    });

    this.setPersonalFieldsReadonly(true);
    this.setNationalityReadonly(true);
    this.updateCompanyValidator();
    this.updateVendorSelectionValidator();
    this.clearMessages();

    const subscription =
      this.visitorService.getVisitorForEdit(vendor.visitorId).subscribe({

        next: (details: VisitorEditResponse) => {
          this.existingVendorDocuments = details.documents ?? [];

          if (details.visitor?.nationality) {
            this.registrationForm.patchValue({
              nationality: details.visitor.nationality
            });
            this.applyNationalityValidators(false);
          }

          this.isLoadingVendorDetails = false;
          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Failed to load vendor details:', error);
          this.isLoadingVendorDetails = false;
          this.existingVendorDocuments = [];
          this.errorMessage =
            error?.error?.message ??
            'Unable to load the selected vendor details.';
          this.cdr.detectChanges();
        }
      });

    this.subscriptions.add(subscription);
  }

  /**
   * For Visitor / Guest, if both email and mobile belong to the same
   * existing visitor, reuse that visitor's master data just like Vendor.
   */
  checkExistingVisitorByContact(): void {

    const visitorType =
      this.registrationForm.get('visitorType')?.value;

    if (visitorType === 'VENDOR' || this.isCreatingNewVendor) {
      return;
    }

    const email = String(
      this.registrationForm.get('email')?.value ?? ''
    ).trim().toLowerCase();

    const mobileNumber = String(
      this.registrationForm.get('mobileNumber')?.value ?? ''
    ).trim();

    if (!email || !mobileNumber) {
      return;
    }

    const visitorByEmail =
      this.visitors.find(visitor =>
        visitor.visitorType !== 'VENDOR' &&
        visitor.email?.trim().toLowerCase() === email
      );

    const visitorByMobile =
      this.visitors.find(visitor =>
        visitor.visitorType !== 'VENDOR' &&
        visitor.mobileNumber?.trim() === mobileNumber
      );

    if (
      !visitorByEmail ||
      !visitorByMobile ||
      visitorByEmail.id !== visitorByMobile.id
    ) {
      return;
    }

    this.loadExistingVisitor(visitorByEmail);
  }

  onContactInputChanged(): void {

    if (!this.isExistingVisitor || this.isExistingVendor) {
      return;
    }

    this.isExistingVisitor = false;
    this.selectedVisitorId = null;
    this.existingVendorDocuments = [];

    this.setPersonalFieldsReadonly(false);
    this.setNationalityReadonly(false);
    this.onNationalityChange();
  }

  private loadExistingVisitor(visitor: VisitorResponse): void {

    if (this.isExistingVisitor && this.selectedVisitorId === visitor.id) {
      return;
    }

    this.selectedVisitorId = visitor.id;
    this.isExistingVisitor = true;
    this.isExistingVendor = false;
    this.isCreatingNewVendor = false;
    this.isLoadingVendorDetails = true;
    this.existingVendorDocuments = [];

    this.registrationForm.patchValue({
      firstName: visitor.firstName,
      lastName: visitor.lastName,
      email: visitor.email,
      mobileNumber: visitor.mobileNumber,
      companyName: visitor.companyName ?? '',
      documents: []
    });

    this.setPersonalFieldsReadonly(true);
    this.setNationalityReadonly(true);
    this.updateCompanyValidator();

    const subscription =
      this.visitorService.getVisitorForEdit(visitor.id).subscribe({

        next: (details: VisitorEditResponse) => {
          this.existingVendorDocuments = details.documents ?? [];

          this.registrationForm.patchValue({
            firstName: details.visitor?.firstName ?? visitor.firstName,
            lastName: details.visitor?.lastName ?? visitor.lastName,
            email: details.visitor?.email ?? visitor.email,
            mobileNumber: details.visitor?.mobileNumber ?? visitor.mobileNumber,
            companyName: details.visitor?.companyName ?? visitor.companyName ?? ''
          });

          if (details.visitor?.nationality) {
            this.registrationForm.patchValue({
              nationality: details.visitor.nationality
            });
            this.applyNationalityValidators(false);
          }

          this.isLoadingVendorDetails = false;
          this.cdr.detectChanges();
        },

        error: (error: any) => {
          console.error('Failed to load existing visitor details:', error);
          this.isLoadingVendorDetails = false;
          this.existingVendorDocuments = [];
          this.errorMessage =
            error?.error?.message ??
            'Unable to load the existing visitor details.';
          this.cdr.detectChanges();
        }
      });

    this.subscriptions.add(subscription);
  }

  createNewVendor(): void {

    this.selectedVendorId = null;
    this.selectedVisitorId = null;
    this.isExistingVendor = false;
    this.isExistingVisitor = false;
    this.isCreatingNewVendor = true;
    this.isLoadingVendorDetails = false;
    this.existingVendorDocuments = [];

    this.registrationForm.get('vendorId')?.setValue('');

    this.registrationForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      companyName: '',
      nationality: '',
      aadhaarNumber: null,
      panNumber: null,
      passportNumber: null,
      documents: []
    });

    this.setPersonalFieldsReadonly(false);
    this.setNationalityReadonly(false);
    this.onNationalityChange();
    this.updateCompanyValidator();
    this.updateVendorSelectionValidator();
    this.clearMessages();
  }

  cancelNewVendor(): void {
    this.clearVendorSelection();
  }

  private clearVendorSelection(): void {

    this.clearExistingProfile();

    this.registrationForm.get('vendorId')?.setValue('');

    this.registrationForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      companyName: '',
      nationality: '',
      aadhaarNumber: null,
      panNumber: null,
      passportNumber: null,
      documents: []
    });

    this.setPersonalFieldsReadonly(false);
    this.setNationalityReadonly(
      this.registrationForm.get('visitorType')?.value === 'VENDOR'
    );
    this.onNationalityChange();
    this.updateCompanyValidator();
    this.updateVendorSelectionValidator();
  }

  private clearExistingProfile(): void {
    this.selectedVendorId = null;
    this.selectedVisitorId = null;
    this.isExistingVendor = false;
    this.isExistingVisitor = false;
    this.isCreatingNewVendor = false;
    this.isLoadingVendorDetails = false;
    this.existingVendorDocuments = [];
  }

  private setNationalityReadonly(readonly: boolean): void {
    const control = this.registrationForm.get('nationality');

    if (readonly) {
      control?.disable({ emitEvent: false });
    } else {
      control?.enable({ emitEvent: false });
    }
  }

  private setPersonalFieldsReadonly(readonly: boolean): void {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'mobileNumber',
      'companyName'
    ];

    fields.forEach(field => {
      const control = this.registrationForm.get(field);

      if (readonly) {
        control?.disable({ emitEvent: false });
      } else {
        control?.enable({ emitEvent: false });
      }
    });
  }

  private updateCompanyValidator(): void {
    const control = this.registrationForm.get('companyName');

    if (!control) {
      return;
    }

    control.setValidators([
      Validators.maxLength(150),
      ...(this.isCreatingNewVendor
        ? [Validators.required]
        : [])
    ]);

    control.updateValueAndValidity({ emitEvent: false });
  }

  private updateVendorSelectionValidator(): void {
    const control = this.registrationForm.get('vendorId');

    if (!control) {
      return;
    }

    const visitorType = this.registrationForm.get('visitorType')?.value;

    control.setValidators(
      visitorType === 'VENDOR' && !this.isCreatingNewVendor
        ? [Validators.required]
        : []
    );

    control.updateValueAndValidity({ emitEvent: false });
  }

  getDocumentViewUrl(documentId: string): string {
    return this.visitorService.getDocumentViewUrl(documentId);
  }

  getDocumentName(documentPath: string): string {
    if (!documentPath) {
      return 'Document';
    }

    return documentPath
      .split(/[\\/]/)
      .pop() || 'Document';
  }

  hasExistingVendorDocuments(): boolean {
    return this.existingVendorDocuments.length > 0;
  }

  get isExistingProfile(): boolean {
    return this.isExistingVendor || this.isExistingVisitor;
  }

  // Nationality / Proof
  
 onNationalityChange(): void {
    this.applyNationalityValidators(true);
  }

  private applyNationalityValidators(clearValues: boolean): void {
    const nationality =
      this.registrationForm.get('nationality')?.value;

    const aadhaarControl =
      this.registrationForm.get('aadhaarNumber');

    const panControl =
      this.registrationForm.get('panNumber');

    const passportControl =
      this.registrationForm.get('passportNumber');

    aadhaarControl?.clearValidators();
    panControl?.clearValidators();
    passportControl?.clearValidators();

    if (clearValues) {
      aadhaarControl?.reset(null);
      panControl?.reset(null);
      passportControl?.reset(null);
    }

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


  get isDomesticExistingProfile(): boolean {
    return this.isExistingProfile &&
      this.registrationForm.get('nationality')?.value === 'DOMESTIC';
  }

  get isInternationalExistingProfile(): boolean {
    return this.isExistingProfile &&
      this.registrationForm.get('nationality')?.value === 'INTERNATIONAL';
  }


  
  // Submit
  

  submitRegistration(): void {

  this.clearMessages();

  if (this.registrationForm.invalid) {
    this.registrationForm.markAllAsTouched();

    this.errorMessage =
      'Please complete all required fields.';

    return;
  }

  if (!this.validateSupportingDocuments()) {
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


          /*
           * Registration is successful.
           *
           * Now upload proof documents separately
           * using the visitorId returned by the backend.
           */

          const files =
            this.getSelectedDocuments();


          if (
            files.length > 0 &&
            response.visitorId
          ) {

            this.uploadProofDocuments(
              response,
              files
            );

          } else {

            /*
             * No proof documents selected.
             * Registration is already complete.
             */

            this.registrationSuccess = true;

            this.isSubmitting = false;

            this.successMessage =
              response.message ||
              'Visit registered successfully.';

            this.cdr.detectChanges();
          }


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


  
  // Proof Document Upload
  

  private uploadProofDocuments(
    response: RegistrationResponse,
    files: File[]
  ): void {

    const visitorId =
      response.visitorId;


    if (!visitorId) {

      console.error(
        'Visitor ID is missing from registration response.'
      );

      this.isSubmitting = false;

      this.registrationSuccess = true;

      this.successMessage =
        response.message ||
        'Visit registered successfully, but proof documents could not be uploaded because visitor ID was missing.';

      this.cdr.detectChanges();

      return;
    }


    console.log(
      'Uploading proof documents for visitor:',
      visitorId
    );


    const subscription =
      this.proofDocumentService
        .uploadProofDocuments(
          visitorId,
          files
        )
        .subscribe({

          next: (documents) => {

            console.log(
              'Proof documents uploaded successfully:',
              documents
            );


            this.registrationSuccess = true;

            this.isSubmitting = false;


            this.successMessage =
              'Visit registered and proof documents uploaded successfully.';


            this.cdr.detectChanges();
          },


          error: (error: any) => {

            console.error(
              'Proof document upload failed:',
              error
            );


            /*
             * Important:
             *
             * The visit itself was already registered successfully.
             * Only the document upload failed.
             */

            this.registrationSuccess = true;

            this.isSubmitting = false;


            this.successMessage =
              response.message ||
              'Visit registered successfully.';


            this.errorMessage =
              error?.error?.message ??
              'Visit was registered, but proof document upload failed.';


            this.cdr.detectChanges();
          }

        });


    this.subscriptions.add(subscription);
  }


  
  // Documents
  

  onDocumentsSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    const files =
      input.files;


    if (!files || files.length === 0) {
      return;
    }


    const maxSize =
      5 * 1024 * 1024;


    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ];


    const newFiles =
      Array.from(files);


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
      this.registrationForm
        .get('documents')
        ?.value;


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
        (_, fileIndex) =>
          fileIndex !== index
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


  
  // Build backend request
  

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
    // Convert nationality-specific proof fields
    // into backend fields
    // ------------------------------------------------------------------------

    let proofType: ProofType | null = null;

    let proofNumber: string | null = null;


    const nationality =
      value.nationality as Nationality | null;


    if (nationality === 'DOMESTIC') {

      /*
       * For domestic visitors, the form requires
       * both Aadhaar and PAN.
       *
       * RegistrationRequest supports only one
       * proofType/proofNumber, so Aadhaar is used
       * as the primary proof.
       */

      if (value.aadhaarNumber) {

        proofType = 'AADHAAR';

        proofNumber =
          String(
            value.aadhaarNumber
          ).trim();
      }


    } else if (
      nationality === 'INTERNATIONAL'
    ) {

      if (value.passportNumber) {

        proofType = 'PASSPORT';

        proofNumber =
          String(
            value.passportNumber
          ).trim();
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
        String(
          value.firstName ?? ''
        ).trim(),


      lastName:
        String(
          value.lastName ?? ''
        ).trim(),


      email:
        String(
          value.email ?? ''
        )
          .trim()
          .toLowerCase(),


      mobileNumber:
        String(
          value.mobileNumber ?? ''
        ).trim(),


      companyName:
        String(
          value.companyName ?? ''
        ).trim(),


      purpose:
        String(
          value.purpose ?? ''
        ).trim(),


      hostId:
        String(
          value.hostId ?? ''
        ).trim(),


      visitDate,


      expectedArrivalTime:
        this.formatTime(arrival),


      expectedDepartureTime:
        this.formatTime(departure),


      remarks:
        value.remarks
          ? String(
              value.remarks
            ).trim()
          : null,


      nationality:
        nationality as Nationality,


      aadharNumber:
        value.aadhaarNumber
          ? String(
              value.aadhaarNumber
            ).trim()
          : null,


      panNumber:
        value.panNumber
          ? String(
              value.panNumber
            ).trim()
          : null,


      passportNumber:
        value.passportNumber
          ? String(
              value.passportNumber
            ).trim()
          : null,


    };


    return request;
  }


  
  // Error handling
  

  private handleRegistrationError(
    error: any
  ): void {

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


  
  // Form helpers
  

  isInvalid(
    controlName: string
  ): boolean {

    const control =
      this.registrationForm.get(
        controlName
      );


    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty
      )
    );
  }


  
  // Reset
  

  resetForm(): void {

    this.registrationForm.reset();


    this.registrationForm.patchValue({
      documents: []
    });


    this.createdVisit = null;

    this.registrationForm.get('vendorId')?.setValue('');
    this.selectedVendorId = null;
    this.selectedVisitorId = null;
    this.isExistingVendor = false;
    this.isExistingVisitor = false;
    this.isCreatingNewVendor = false;
    this.existingVendorDocuments = [];
    this.isLoadingVendorDetails = false;
    this.setPersonalFieldsReadonly(false);
    this.setNationalityReadonly(false);
    this.updateCompanyValidator();
    this.updateVendorSelectionValidator();

    this.registrationSuccess = false;

    this.isSubmitting = false;


    this.clearMessages();


    this.minDateTime =
      this.getCurrentDateTime();


    /*
     * Reapply nationality validators
     * after resetting the form.
     */

    this.onNationalityChange();
  }


  createAnotherVisit(): void {

    this.resetForm();
  }


  
  // Messages
  

  private clearMessages(): void {

    this.errorMessage = '';

    this.successMessage = '';
  }


  
  // Date / time helpers
  

  private parseDateTime(
    value: string
  ): Date | null {

    if (!value) {
      return null;
    }


    const date =
      new Date(value);


    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }


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


    const seconds =
      String(
        date.getSeconds()
      ).padStart(2, '0');


    return `${hours}:${minutes}:${seconds}`;
  }


  private getCurrentDateTime(): string {

    const now =
      new Date();


    const year =
      now.getFullYear();


    const month =
      String(
        now.getMonth() + 1
      ).padStart(2, '0');


    const day =
      String(
        now.getDate()
      ).padStart(2, '0');


    const hours =
      String(
        now.getHours()
      ).padStart(2, '0');


    const minutes =
      String(
        now.getMinutes()
      ).padStart(2, '0');


    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }


  private validateSupportingDocuments(): boolean {

  const selectedDocuments = this.getSelectedDocuments();

  const hasExistingDocuments =
    this.existingVendorDocuments.length > 0;

  if (!hasExistingDocuments && selectedDocuments.length === 0) {

    this.errorMessage =
      'No supporting document is available. Please upload at least one document.';

    return false;
  }

  return true;
}
}

