import {Component,OnInit,ChangeDetectorRef,inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {VendorService,VendorEditResponse} from '../../../core/services/vendor/vendor.service';
import {NdaDocumentService} from '../../../core/services/document/nda-document.service';
import {ProofDocumentService} from '../../../core/services/document/proof-document.service';
import { DocumentResponse } from '../../../core/models/document/DocumentResponse';
//import { API_CONFIG } from '../../../../environments/environment.dev';
import { DocumentService } from '../../../core/services/document/document.service';

@Component({
  selector: 'app-vendor-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
     
  ],
  templateUrl: './vendor-edit.html',
  styleUrl: './vendor-edit.css'
})
export class VendorEditComponent implements OnInit {

  private readonly vendorService =inject(VendorService);

  private readonly ndaDocumentService =inject(NdaDocumentService);

  private readonly route =inject(ActivatedRoute);

  private readonly router =inject(Router);

  private readonly changeDetectorRef =inject(ChangeDetectorRef);

  private readonly documentService =inject(DocumentService);

  private readonly proofDocumentService = inject(ProofDocumentService);

 // readonly apiBaseUrl =API_CONFIG.BASE_URL;


  vendorId = '';

  vendorData: VendorEditResponse | null = null;

  latestNda: DocumentResponse | null = null;

  ndaHistory: DocumentResponse[] = [];

  loading = true;

  ndaLoading = false;

  errorMessage = '';

  saving = false;

  //activeModal: string | null = null;

  pendingDocuments: File[] = [];

  showVisitHistory = false;

  showAllNdas = false;

 // showBlacklistModal = false;

 // blacklistReason = '';

 // blacklistLoading = false;


  showExtendNdaModal = false;

newNdaValidUntil = '';

supportingNdaDocument: File | null = null;

extendingNda = false;

ndaExtendError = '';

  ngOnInit(): void {
    this.vendorId =this.route.snapshot.paramMap.get('vendorId') ?? '';
    if (!this.vendorId) {
    this.errorMessage ='Vendor ID not found.';
    this.loading = false;
    return;
    }

    this.loadVendor();
  }

  private loadVendor(): void {
    this.loading = true;
    this.errorMessage = '';
    this.vendorService.getVendorEditDetails(this.vendorId).subscribe({
             
        next: (response) => {

          console.log('VENDOR EDIT RESPONSE:',response);

          this.vendorData = response;

          this.loading = false;

          this.loadNdaDetails();

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error('Failed to load vendor details:',error);

          this.vendorData = null;

          this.loading = false;

          this.errorMessage ='Failed to load vendor details.';

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

    const visitorId =this.vendorData.visitor.id;

    this.ndaLoading = true;

    this.ndaDocumentService
      .getLatestNda(visitorId)
      .subscribe({

        next: (response) => {
// console.log('LATEST NDA RESPONSE:', response);
//   console.log('VALID FROM:', response.effective_validity);
//   console.log('CREATED AT:', response.createdAt);
          this.latestNda = response;

          this.ndaLoading = false;

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          // console.error(
          //   'Failed to load latest NDA:',
          //   error
          // );

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
  const visitorId = this.vendorData?.visitor?.id;

  return visitorId? this.documentService.getVisitorPhotoUrl(visitorId): '';
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

  const input =event.target as HTMLInputElement;

  if (
    !input.files ||input.files.length === 0
  ) {
    return;
  }

  const file =input.files[0];

  if (file.type !== 'application/pdf') {
  this.supportingNdaDocument = null;
  this.ndaExtendError = 'Only PDF files are allowed.';
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
    this.ndaExtendError = 'No existing NDA found.';
    return;
  }

  if (!this.newNdaValidUntil) {
    this.ndaExtendError = 'Please select a new valid-until date.';
    return;
  }

  if (!this.supportingNdaDocument) {
    this.ndaExtendError = 'Please upload the supporting document.';
    return;
  }

  const newExpiryDate = new Date(this.newNdaValidUntil);
  const currentExpiryDate = new Date(this.latestNda.validUntil ?? '');

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
        console.error('Failed to extend NDA validity:', error);

        this.extendingNda = false;
        this.ndaExtendError =
          error?.error?.message ||
          'Failed to extend NDA validity.';

        this.changeDetectorRef.markForCheck();
      }
    });
}

  // openBlacklistModal(): void {

  //   this.blacklistReason = '';

  //   this.showBlacklistModal = true;
  // }

  // closeBlacklistModal(): void {

  //   this.showBlacklistModal = false;

  //   this.blacklistReason = '';
  // }

  get isBlacklisted(): boolean {
    return this.vendorData?.blacklisted ?? false;
  }

  get vendorStatus(): string {
    return this.isBlacklisted
      ? 'Blacklisted'
      : 'Active';
  }

  get ndaStatus(): string {
  return this.latestNda?.status ?? 'NO NDA';
}
  // get ndaStatusClass(): string {

  //   return this.ndaStatus
  //     .toLowerCase()
  //     .replaceAll(' ', '-');
  // }

  get ndaValidUntil(): string | null {
    return this.latestNda?.validUntil ?? null;
  }

  // get ndaSignedDate(): string | null {

  //   return this.latestNda?.createdAt ?? null;
  // }

  get ndaValidFrom(): string | null {
  return this.latestNda?.effective_validity ?? null;
}

  viewDocument(documentId: string): void {
  window.open(this.documentService.getDocumentViewUrl(documentId),'_blank');
}

  viewNda(documentId: string): void {
    this.viewDocument(documentId);
  }

  // changePhoto(): void {

  //   console.log(
  //     'Change photo clicked'
  //   );
  // }

 saveChanges(): void {if (!this.vendorData || this.saving) {
    return;
  }

  if (this.pendingDocuments.length === 0) {
    return;
  }

  this.saving = true;
  this.errorMessage = '';

  this.proofDocumentService
    .uploadProofDocuments(
      this.vendorData.visitor.id,
      this.pendingDocuments
    )
    .subscribe({
      next: () => {
        this.pendingDocuments = [];
        this.saving = false;
        this.loadVendor();
      },
      error: (error) => {
        console.error('Failed to save documents:', error);

        this.saving = false;
        this.errorMessage =
          error?.error?.message ?? 'Failed to save documents.';

        this.changeDetectorRef.markForCheck();
      }
    });
}

//   getNdaHistoryStatus(nda: DocumentResponse): string {

//   // Another NDA replaced this document
//   if (nda.overwrittenBy) {
//     return 'OVERRIDDEN';
//   }

//   // No replacement and validity has ended
//   if (!nda.validUntil) {
//     return 'EXPIRED';
//   }

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const expiryDate = new Date(nda.validUntil);
//   expiryDate.setHours(0, 0, 0, 0);

//   // Valid-until date has reached/passed
//   if (expiryDate <= today) {
//     return 'EXPIRED';
//   }

//   return 'CURRENT';
// }
  cancel(): void {

    this.router.navigate([
      '/admin/vendors'
    ]);
  }

 
formatDate(value: string | null,includeTime = false): string {
if (!value) {
    return '-';
  }
const datePart = value.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  if (!includeTime) {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  const timePart = value.split('T')[1];

  if (!timePart) {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  const [hours, minutes] = timePart.split(':').map(Number);

  date.setHours(hours, minutes);

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
  // downloadDocument(
  //   documentId: string
  // ): void {

  //   const url =
  //     `${this.apiBaseUrl}/api/documents/${documentId}/view`;

  //   const link =
  //     document.createElement('a');

  //   link.href = url;

  //   link.download = '';

  //   document.body.appendChild(link);

  //   link.click();

  //   document.body.removeChild(link);
  // }

  
uploadDocuments(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) {
    return;
  }

  const files = Array.from(input.files);

  this.pendingDocuments.push(...files);

  console.log('Documents selected:', this.pendingDocuments);

  input.value = '';

  this.changeDetectorRef.markForCheck();
}

  // formatDateTime(
  //   value: string | null
  // ): string {

  //   if (!value) {
  //     return '-';
  //   }

  //   return new Date(value)
  //     .toLocaleString(
  //       'en-IN',
  //       {
  //         day: '2-digit',
  //         month: 'short',
  //         year: 'numeric',
  //         hour: '2-digit',
  //         minute: '2-digit'
  //       }
  //     );
  // }


  removePendingDocument(index: number): void {
  this.pendingDocuments.splice(index, 1);
  this.changeDetectorRef.markForCheck();
}


get ndaDocumentLabel(): string {
  if (!this.ndaValidUntil || !this.newNdaValidUntil) {
    return 'Supporting Document';
  }

  const currentDate = new Date(this.ndaValidUntil);
  const newDate = new Date(this.newNdaValidUntil);

  let months =
    (newDate.getFullYear() - currentDate.getFullYear()) * 12 +
    (newDate.getMonth() - currentDate.getMonth());

  // Adjust if the new date falls before the current day of the month.
  if (newDate.getDate() < currentDate.getDate()) {
    months--;
  }

  if (months >= 12 && months <= 60) {
    return 'Renewal Document';
  }

  return 'Supporting Document';
}
}