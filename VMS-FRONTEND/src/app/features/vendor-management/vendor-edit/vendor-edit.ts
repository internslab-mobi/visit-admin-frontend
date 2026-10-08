import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  VendorService,
  VendorEditResponse
} from '../../../core/services/vendor/vendor.service';

import {
  NdaDocumentService,
  NdaDocumentResponse
} from '../../../core/services/document/nda-document.service';

import { API_CONFIG } from '../../../../environments/environment.dev';

@Component({
  selector: 'app-vendor-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './vendor-edit.html',
  styleUrl: './vendor-edit.css'
})
export class VendorEditComponent implements OnInit {

  private readonly vendorService =
    inject(VendorService);

  private readonly ndaDocumentService =
    inject(NdaDocumentService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  readonly apiBaseUrl =
    API_CONFIG.BASE_URL;

  vendorId = '';

  vendorData: VendorEditResponse | null = null;

  latestNda: NdaDocumentResponse | null = null;

  ndaHistory: NdaDocumentResponse[] = [];

  loading = true;

  ndaLoading = false;

  errorMessage = '';

  saving = false;

  activeModal: string | null = null;

  pendingDocuments: File[] = [];

  showVisitHistory = false;

  showAllNdas = false;

  showBlacklistModal = false;

  blacklistReason = '';

  blacklistLoading = false;


  showExtendNdaModal = false;

newNdaValidUntil = '';

supportingNdaDocument: File | null = null;

extendingNda = false;

ndaExtendError = '';

  ngOnInit(): void {

    this.vendorId =
      this.route.snapshot.paramMap.get('vendorId') ?? '';

    if (!this.vendorId) {

      this.errorMessage =
        'Vendor ID not found.';

      this.loading = false;

      return;
    }

    this.loadVendor();
  }

  private loadVendor(): void {

    this.loading = true;

    this.errorMessage = '';

    this.vendorService
      .getVendorEditDetails(this.vendorId)
      .subscribe({

        next: (response) => {

          console.log(
            'VENDOR EDIT RESPONSE:',
            response
          );

          this.vendorData = response;

          this.loading = false;

          this.loadNdaDetails();

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load vendor details:',
            error
          );

          this.vendorData = null;

          this.loading = false;

          this.errorMessage =
            'Failed to load vendor details.';

          this.changeDetectorRef.markForCheck();
        }

      });
  }

  private loadNdaDetails(): void {

    if (!this.vendorData?.visitor?.id) {
      this.latestNda = null;
      this.ndaHistory = [];
      return;
    }

    const visitorId =
      this.vendorData.visitor.id;

    this.ndaLoading = true;

    this.ndaDocumentService
      .getLatestNda(visitorId)
      .subscribe({

        next: (response) => {
console.log('LATEST NDA RESPONSE:', response);
  console.log('VALID FROM:', response.validFrom);
  console.log('CREATED AT:', response.createdAt);
          this.latestNda = response;

          this.ndaLoading = false;

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load latest NDA:',
            error
          );

          this.latestNda = null;

          this.ndaLoading = false;

          this.changeDetectorRef.markForCheck();
        }

      });

    this.ndaDocumentService
      .getNdaHistory(visitorId)
      .subscribe({

        next: (response) => {

          this.ndaHistory = response;

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load NDA history:',
            error
          );

          this.ndaHistory = [];

          this.changeDetectorRef.markForCheck();
        }

      });
  }

  get visitorPhotoUrl(): string {

    if (!this.vendorData?.visitor?.id) {
      return '';
    }

    return `${this.apiBaseUrl}/api/documents/visitor/${this.vendorData.visitor.id}/photo`;
  }

  openVisitHistory(): void {

    this.showVisitHistory = true;
  }

  closeVisitHistory(): void {

    this.showVisitHistory = false;
  }

  openAllNdas(): void {

    this.showAllNdas = true;
  }

  closeAllNdas(): void {

    this.showAllNdas = false;
  }

  openExtendNdaModal(): void {

  this.newNdaValidUntil = '';

  this.supportingNdaDocument = null;

  this.ndaExtendError = '';

  this.showExtendNdaModal = true;
}

closeExtendNdaModal(): void {

  if (this.extendingNda) {
    return;
  }

  this.showExtendNdaModal = false;

  this.newNdaValidUntil = '';

  this.supportingNdaDocument = null;

  this.ndaExtendError = '';
}

onSupportingNdaSelected(
  event: Event
): void {

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

  if (file.type !== 'application/pdf') {

    this.ndaExtendError =
      'Only PDF files are allowed.';

    input.value = '';

    return;
  }

  this.supportingNdaDocument = file;

  this.ndaExtendError = '';

  input.value = '';
}

extendNdaValidity(): void {

  if (!this.vendorData?.visitor?.id) {
    return;
  }

  if (!this.latestNda) {

    this.ndaExtendError =
      'No existing NDA found.';

    return;
  }

  if (!this.newNdaValidUntil) {

    this.ndaExtendError =
      'Please select a new valid-until date.';

    return;
  }

  if (!this.supportingNdaDocument) {

    this.ndaExtendError =
      'Please upload the supporting document.';

    return;
  }

  const newExpiryDate =
    new Date(this.newNdaValidUntil);

  const currentExpiryDate =
    new Date(this.latestNda.validUntil ?? '');

  if (
    !this.latestNda.validUntil ||
    newExpiryDate <= currentExpiryDate
  ) {

    this.ndaExtendError =
      'New valid-until date must be later than the current expiry date.';

    return;
  }

  this.extendingNda = true;

  this.ndaExtendError = '';

  this.ndaDocumentService
    .extendNdaValidity(
      this.vendorData.visitor.id,
      this.supportingNdaDocument,
      this.newNdaValidUntil
    )
    .subscribe({

      next: (response) => {

        this.latestNda = response;

        this.extendingNda = false;

        this.showExtendNdaModal = false;

        this.newNdaValidUntil = '';

        this.supportingNdaDocument = null;

        this.loadNdaDetails();

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {

        console.error(
          'Failed to extend NDA validity:',
          error
        );

        this.extendingNda = false;

        this.ndaExtendError =
          error?.error?.message ||
          'Failed to extend NDA validity.';

        this.changeDetectorRef.markForCheck();
      }

    });
}
  openBlacklistModal(): void {

    this.blacklistReason = '';

    this.showBlacklistModal = true;
  }

  closeBlacklistModal(): void {

    this.showBlacklistModal = false;

    this.blacklistReason = '';
  }

  get isBlacklisted(): boolean {

    return this.vendorData?.blacklisted ?? false;
  }

  get vendorStatus(): string {

    return this.isBlacklisted
      ? 'Blacklisted'
      : 'Active';
  }

  get ndaStatus(): string {

    const validUntil =
      this.latestNda?.validUntil;

    if (!validUntil) {
      return 'No NDA';
    }

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const expiryDate =
      new Date(validUntil);

    expiryDate.setHours(
      0,
      0,
      0,
      0
    );

    return expiryDate >= today
      ? 'ACTIVE'
      : 'EXPIRED';
  }

  get ndaStatusClass(): string {

    return this.ndaStatus
      .toLowerCase()
      .replaceAll(' ', '-');
  }

  get ndaValidUntil(): string | null {

    return this.latestNda?.validUntil ?? null;
  }

  // get ndaSignedDate(): string | null {

  //   return this.latestNda?.createdAt ?? null;
  // }

  get ndaValidFrom(): string | null {
  return this.latestNda?.validFrom ?? null;
}

  viewDocument(
    documentId: string
  ): void {

    const url =
      `${this.apiBaseUrl}/api/documents/${documentId}/view`;

    window.open(
      url,
      '_blank'
    );
  }

  viewNda(
    documentId: string
  ): void {

    this.viewDocument(documentId);
  }

  changePhoto(): void {

    console.log(
      'Change photo clicked'
    );
  }

  saveChanges(): void {

    if (!this.vendorData) {
      return;
    }

    this.saving = true;

    if (this.pendingDocuments.length === 0) {

      this.saving = false;

      return;
    }

    const formData =
      new FormData();

    this.pendingDocuments.forEach(
      file => {
        formData.append(
          'files',
          file
        );
      }
    );

    this.vendorService
      .uploadProofDocuments(
        this.vendorData.visitor.id,
        formData
      )
      .subscribe({

        next: () => {

          this.pendingDocuments = [];

          this.saving = false;

          this.loadVendor();
        },

        error: (error) => {

          console.error(
            'Failed to save documents:',
            error
          );

          this.saving = false;

          this.errorMessage =
            'Failed to save documents.';
        }

      });
  }


  getNdaHistoryStatus(nda: NdaDocumentResponse): string {

  // Another NDA replaced this document
  if (nda.overwrittenBy) {
    return 'OVERRIDDEN';
  }

  // No replacement and validity has ended
  if (!nda.validUntil) {
    return 'EXPIRED';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(nda.validUntil);
  expiryDate.setHours(0, 0, 0, 0);

  // Valid-until date has reached/passed
  if (expiryDate <= today) {
    return 'EXPIRED';
  }

  return 'CURRENT';
}
  cancel(): void {

    this.router.navigate([
      '/admin/vendors'
    ]);
  }

 formatDate(value: string | null): string {

  if (!value) {
    return '-';
  }

  const datePart = value.split('T')[0];

  const [year, month, day] = datePart.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  );
}
  downloadDocument(
    documentId: string
  ): void {

    const url =
      `${this.apiBaseUrl}/api/documents/${documentId}/view`;

    const link =
      document.createElement('a');

    link.href = url;

    link.download = '';

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  uploadDocuments(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const files =
      Array.from(input.files);

    this.pendingDocuments.push(
      ...files
    );

    console.log(
      'Documents selected:',
      this.pendingDocuments
    );

    input.value = '';

    this.changeDetectorRef.markForCheck();
  }

  formatDateTime(
    value: string | null
  ): string {

    if (!value) {
      return '-';
    }

    return new Date(value)
      .toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );
  }


  removePendingDocument(index: number): void {
  this.pendingDocuments.splice(index, 1);
  this.changeDetectorRef.markForCheck();
}
}