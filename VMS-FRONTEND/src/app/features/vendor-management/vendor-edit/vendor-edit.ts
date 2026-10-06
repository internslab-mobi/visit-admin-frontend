import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  VendorService
} from '../../../core/services/vendor/vendor.service';
import { NdaDocumentResponse, NdaDocumentService } from '../../../core/services/document/nda-document.service';
import {
  VisitorService,
  VisitorEditResponse,
  VisitorDocument,
  VisitorVisit
} from '../../../core/services/visitor/visitor.service';

import {
  ProofDocumentService
} from '../../../core/services/document/proof-document.service';


@Component({
  selector: 'app-vendor-edit',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './vendor-edit.html',
  styleUrl: './vendor-edit.css'
})
export class VendorEditComponent implements OnInit {

  /* =====================================================
     SERVICES
  ===================================================== */

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  private readonly vendorService =
    inject(VendorService);

  private readonly visitorService =
    inject(VisitorService);

  private readonly proofDocumentService =
    inject(ProofDocumentService);

    private documentservice=inject(NdaDocumentService)

  /* =====================================================
     VENDOR
  ===================================================== */

  vendorId = '';

  private visitorId = '';

  vendor = {
    id: '',
    visitorType: 'VENDOR',

    firstName: '',
    lastName: '',

    email: '',
    mobileNumber: '',

    companyName: '',
    companyPhone: '',
    companyEmail: '',

    /*
     * This field is kept only because the current UI object
     * contains it.
     *
     * NDA validity is NOT stored here.
     */
    validity: '',

    status: 'ACTIVE'
  };


  /* =====================================================
     PHOTO
  ===================================================== */

  photoUrl = '';

  selectedPhoto: File | null = null;


  /* =====================================================
     DOCUMENTS
  ===================================================== */

  documents: {
    documentType: string;
    fileName: string;
    uploadedOn: string;
  }[] = [];

  selectedFiles: File[] = [];


  /* =====================================================
     VISITS
  ===================================================== */

  visits: VisitorVisit[] = [];


  /* =====================================================
     BLACKLIST
  ===================================================== */

  blacklisted = false;

  blacklistInfo:
    VisitorEditResponse['blacklist'] = null;


  /* =====================================================
     NDA
  ===================================================== */

  nda = {
    status: 'INACTIVE',

    signedOn: '',

    validUntil: '',

    latest: {
      fileName: '',
      uploadedOn: ''
    }
  };


  /*
   * Keep the actual latest NDA response so that we have
   * documentId available when we later connect the
   * validity-update API.
   */
  latestNda: NdaDocumentResponse | null = null;


  /* =====================================================
     UI STATE
  ===================================================== */

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';


  /* =====================================================
     NDA VALIDITY EDIT
  ===================================================== */

  isEditingNdaValidity = false;

  ndaValidityEditValue = '';

  ndaValidityOriginalValue = '';


  /* =====================================================
     MODAL MANAGEMENT
  ===================================================== */

  activeModal:
    | 'VISIT_HISTORY'
    | 'ALL_NDAS'
    | 'BLACKLIST'
    | 'UPLOAD_DOCUMENTS'
    | 'UPLOAD_NDA'
    | null = null;


  /* =====================================================
     BLACKLIST
  ===================================================== */

  blacklistReason = '';

  blacklistError = '';


  /* =====================================================
     INIT
  ===================================================== */

  ngOnInit(): void {

    this.vendorId =
      this.route.snapshot.paramMap.get(
        'vendorId'
      ) ?? '';

    if (!this.vendorId) {

      this.errorMessage =
        'Vendor ID is missing.';

      this.loading = false;

      return;
    }

    this.loadVendor();

    this.changeDetectorRef.markForCheck();
  }


  /* =====================================================
     LOAD VENDOR
  ===================================================== */

  private loadVendor(): void {

    this.loading = true;

    this.errorMessage = '';

    this.vendorService
      .getVendorById(this.vendorId)
      .subscribe({

        next: (response) => {

          /*
           * Save visitor ID because the visitor/document
           * APIs work with visitorId.
           */
          this.visitorId =
            response.visitorId;


          /*
           * Populate vendor information.
           */
          this.vendor = {

            id: response.id,

            visitorType: 'VENDOR',

            firstName:
              response.firstName,

            lastName:
              response.lastName,

            email:
              response.email,

            mobileNumber:
              response.mobileNumber,

            companyName:
              response.companyName ?? '',

            /*
             * These are not returned by
             * GET /api/vendors/{id}.
             */
            companyPhone: '',

            companyEmail: '',

            /*
             * Do not use this for NDA validity.
             */
            validity:
              response.validity ?? '',

            status: 'ACTIVE'
          };


          /*
           * Load visitor information.
           */
          this.loadVisitorDetails(
            response.visitorId
          );


          /*
           * Load latest NDA.
           */
          this.loadLatestNda(
            response.visitorId
          );

        },

        error: (error) => {

          console.error(
            'Failed to load vendor:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load vendor information.';

          this.loading = false;

          this.changeDetectorRef.markForCheck();
        }

      });
  }


  /* =====================================================
     LOAD VISITOR DETAILS
  ===================================================== */

  private loadVisitorDetails(
    visitorId: string
  ): void {

    this.visitorService
      .getVisitorForEdit(visitorId)
      .subscribe({

        next: (
          response: VisitorEditResponse
        ) => {

          /*
           * Visit history.
           */
          this.visits =
            response.visits ?? [];


          /*
           * Blacklist information.
           */
          this.blacklisted =
            response.blacklisted;

          this.blacklistInfo =
            response.blacklist;


          /*
           * Vendor status.
           */
          this.vendor.status =
            response.blacklisted
              ? 'BLACKLISTED'
              : 'ACTIVE';


          /*
           * Proof documents.
           */
          this.loadDocuments(
            visitorId
          );


          /*
           * Visitor photo.
           */
          this.loadVisitorPhoto(
            visitorId
          );


          this.loading = false;

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load visitor details:',
            error
          );

          this.errorMessage =
            error?.error?.message ??
            'Failed to load visitor details.';

          this.loading = false;

          this.changeDetectorRef.markForCheck();
        }

      });
  }


  /* =====================================================
     LOAD LATEST NDA
  ===================================================== */

  private loadLatestNda(
    visitorId: string
  ): void {

    this.documentservice
      .getLatestNda(visitorId)
      .subscribe({

        next: (response) => {

          this.latestNda =
            response;


          /*
           * Convert backend validity into
           * UI display values.
           */
          const validUntil =
            response.validUntil ?? '';


          const status =
            this.getNdaStatus(
              validUntil
            );


          this.nda = {

            status,

            /*
             * Backend currently gives createdAt.
             * That represents the NDA upload/sign date
             * in the current API.
             */
            signedOn:
              response.createdAt
                ? this.formatDate(
                    response.createdAt
                  )
                : '',

            validUntil:
              validUntil
                ? this.formatDate(
                    validUntil
                  )
                : '',

            latest: {

              fileName:
                this.extractFileName(
                  response.documentPath
                ),

              uploadedOn:
                response.createdAt
                  ? this.formatDate(
                      response.createdAt
                    )
                  : ''
            }
          };


          /*
           * If there is a valid NDA, keep the
           * editable value ready.
           */
          this.ndaValidityOriginalValue =
            validUntil;

          this.ndaValidityEditValue =
            this.convertToInputDate(
              validUntil
            );


          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          /*
           * 404 means there may simply be
           * no NDA uploaded yet.
           */
          console.warn(
            'No latest NDA found:',
            error
          );

          this.latestNda = null;

          this.nda = {

            status: 'INACTIVE',

            signedOn: '',

            validUntil: '',

            latest: {

              fileName: '',

              uploadedOn: ''
            }
          };


          this.changeDetectorRef.markForCheck();
        }

      });
  }


  /* =====================================================
     NDA STATUS
  ===================================================== */

  private getNdaStatus(
    validUntil: string
  ): 'ACTIVE' | 'EXPIRED' | 'INACTIVE' {

    if (!validUntil) {

      return 'INACTIVE';
    }


    const expiryDate =
      new Date(validUntil);


    if (
      isNaN(
        expiryDate.getTime()
      )
    ) {

      return 'INACTIVE';
    }


    /*
     * Compare date only.
     */
    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

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


  /* =====================================================
     LOAD DOCUMENTS
  ===================================================== */

  private loadDocuments(
    visitorId: string
  ): void {

    this.visitorService
      .getVisitorDocuments(visitorId)
      .subscribe({

        next: (
          documents: VisitorDocument[]
        ) => {

          this.documents =
            documents.map(
              document => ({

                documentType:
                  this.getDocumentType(
                    document.documentPath
                  ),

                fileName:
                  this.extractFileName(
                    document.documentPath
                  ),

                uploadedOn:
                  this.formatDate(
                    document.createdAt ?? ''
                  )

              })
            );


          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load vendor documents:',
            error
          );

          this.documents = [];

          this.changeDetectorRef.markForCheck();
        }

      });
  }


  /* =====================================================
     LOAD VISITOR PHOTO
  ===================================================== */

  private loadVisitorPhoto(
    visitorId: string
  ): void {

    this.photoUrl =
      this.visitorService
        .getVisitorPhotoUrl(
          visitorId
        );

    this.changeDetectorRef.markForCheck();
  }


  /* =====================================================
     EXTRACT FILE NAME
  ===================================================== */

  private extractFileName(
    path: string
  ): string {

    if (!path) {

      return '';
    }

    const normalizedPath =
      path.replace(
        /\\/g,
        '/'
      );

    return normalizedPath
      .split('/')
      .pop() ?? '';
  }


  /* =====================================================
     GET DOCUMENT TYPE
  ===================================================== */

  private getDocumentType(
    path: string
  ): string {

    if (!path) {

      return 'Identity Document';
    }

    const fileName =
      this.extractFileName(
        path
      ).toLowerCase();


    if (
      fileName.includes('aadhaar') ||
      fileName.includes('aadhar')
    ) {

      return 'Aadhaar';
    }


    if (
      fileName.includes('passport')
    ) {

      return 'Passport';
    }


    return 'Identity Document';
  }


  /* =====================================================
     MODAL MANAGEMENT
  ===================================================== */

  openModal(
    modal:
      | 'VISIT_HISTORY'
      | 'ALL_NDAS'
      | 'BLACKLIST'
      | 'UPLOAD_DOCUMENTS'
      | 'UPLOAD_NDA'
  ): void {

    this.activeModal =
      modal;

    this.blacklistError =
      '';
  }


  closeModal(): void {

    this.activeModal =
      null;

    this.blacklistReason =
      '';

    this.blacklistError =
      '';
  }


  /* =====================================================
     PHOTO
  ===================================================== */

  changePhoto(
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


    const allowedTypes = [
      'image/jpeg',
      'image/png'
    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      this.errorMessage =
        'Only JPG and PNG images are allowed.';

      return;
    }


    if (
      file.size >
      2 * 1024 * 1024
    ) {

      this.errorMessage =
        'Photo size must not exceed 2 MB.';

      return;
    }


    this.selectedPhoto =
      file;


    const reader =
      new FileReader();


    reader.onload = () => {

      this.photoUrl =
        reader.result as string;

      this.changeDetectorRef.markForCheck();
    };


    reader.readAsDataURL(file);
  }


  /* =====================================================
     DOCUMENT FILE SELECTION / UPLOAD
  ===================================================== */

  uploadDocuments(
    event?: Event
  ): void {

    if (event) {

      const input =
        event.target as HTMLInputElement;


      if (
        !input.files ||
        input.files.length === 0
      ) {

        return;
      }


      this.selectedFiles =
        Array.from(
          input.files
        );
    }


    if (
      this.selectedFiles.length === 0
    ) {

      return;
    }


    if (!this.visitorId) {

      this.errorMessage =
        'Visitor ID is missing.';

      return;
    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    this.proofDocumentService
      .uploadProofDocuments(
        this.visitorId,
        this.selectedFiles
      )
      .subscribe({

        next: () => {

          this.saving = false;

          this.successMessage =
            'Documents uploaded successfully.';


          this.selectedFiles = [];


          this.loadDocuments(
            this.visitorId
          );


          this.closeModal();

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          this.saving = false;

          console.error(
            'Document upload failed:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to upload documents.';

          this.changeDetectorRef.markForCheck();
        }

      });
  }


  /* =====================================================
     NDA UPLOAD
  ===================================================== */

  uploadNda(
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


    /*
     * NDA upload is not connected here yet because
     * the current component does not have the validUntil
     * value/form wired to the backend upload endpoint.
     *
     * Your backend requires:
     *
     * file
     * validUntil
     *
     * for POST /api/documents/{visitorId}/nda.
     */
    console.log(
      'Selected NDA:',
      input.files[0]
    );
  }


  /* =====================================================
     BLACKLIST
  ===================================================== */

  addToBlacklist(): void {

    const reason =
      this.blacklistReason.trim();


    if (!reason) {

      this.blacklistError =
        'Please enter a reason for blacklisting.';

      return;
    }


    if (
      reason.length > 500
    ) {

      this.blacklistError =
        'Reason cannot exceed 500 characters.';

      return;
    }


    /*
     * Blacklist API is intentionally left as-is
     * because this component currently does not inject
     * BlacklistService.
     */
    console.log(
      'Blacklist vendor:',
      this.vendorId,
      reason
    );


    this.closeModal();
  }


  /* =====================================================
     SAVE VENDOR
  ===================================================== */

  saveChanges(): void {

    if (this.saving) {

      return;
    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    if (!this.visitorId) {

      this.errorMessage =
        'Visitor ID is missing.';

      this.saving = false;

      return;
    }


    const request = {

      firstName:
        this.vendor.firstName.trim(),

      lastName:
        this.vendor.lastName.trim(),

      email:
        this.vendor.email.trim(),

      mobileNumber:
        this.vendor.mobileNumber.trim(),

      companyName:
        this.vendor.companyName.trim() || null
    };


    this.visitorService
      .updateVisitor(
        this.visitorId,
        request
      )
      .subscribe({

        next: (updatedVisitor) => {

          this.saving = false;

          this.successMessage =
            'Vendor information updated successfully.';


          this.vendor = {

            ...this.vendor,

            firstName:
              updatedVisitor.firstName,

            lastName:
              updatedVisitor.lastName,

            email:
              updatedVisitor.email,

            mobileNumber:
              updatedVisitor.mobileNumber,

            companyName:
              updatedVisitor.companyName ?? ''
          };


          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to update vendor:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.error?.message ??
            'Failed to update vendor information.';

          this.changeDetectorRef.markForCheck();
        }

      });
  }


  /* =====================================================
     CANCEL
  ===================================================== */

  cancel(): void {

    this.router.navigate([
      '/admin/vendors'
    ]);
  }


  /* =====================================================
     FORMAT DATE
  ===================================================== */

  formatDate(
    value: string
  ): string {

    if (!value) {

      return '-';
    }


    const date =
      new Date(value);


    if (
      isNaN(
        date.getTime()
      )
    ) {

      return value;
    }


    return date.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }


  /* =====================================================
     BLACKLIST CHARACTER COUNT
  ===================================================== */

  get blacklistReasonLength(): number {

    return this.blacklistReason.length;
  }


  /* =====================================================
     EDIT NDA VALIDITY
  ===================================================== */

  startEditingNdaValidity(): void {

    if (!this.latestNda) {

      return;
    }


    this.ndaValidityOriginalValue =
      this.latestNda.validUntil ?? '';


    this.ndaValidityEditValue =
      this.convertToInputDate(
        this.latestNda.validUntil ?? ''
      );


    this.isEditingNdaValidity =
      true;

    this.errorMessage = '';
  }


  /* =====================================================
     SAVE NDA VALIDITY
  ===================================================== */

  saveNdaValidity(): void {

    if (
      !this.ndaValidityEditValue
    ) {

      this.errorMessage =
        'Please select an NDA validity date.';

      return;
    }


    if (!this.latestNda) {

      this.errorMessage =
        'No NDA is available to update.';

      return;
    }


    /*
     * IMPORTANT:
     *
     * Your current backend controller does NOT expose
     * an endpoint for updating vms_document_metadata.valid_until.
     *
     * Therefore we do NOT call a fake endpoint here.
     *
     * Once the backend endpoint is created, this method
     * will call it using:
     *
     * this.latestNda.documentId
     *
     * which is the DocumentMetadata ID.
     */


    this.nda.validUntil =
      this.formatInputDate(
        this.ndaValidityEditValue
      );


    this.nda.status =
      this.getNdaStatus(
        this.nda.validUntil
      );


    this.ndaValidityOriginalValue =
      this.nda.validUntil;


    this.isEditingNdaValidity =
      false;


    this.successMessage =
      'NDA validity updated in the UI. Backend update endpoint is still required.';


    this.changeDetectorRef.markForCheck();
  }


  /* =====================================================
     CANCEL NDA VALIDITY EDIT
  ===================================================== */

  cancelNdaValidityEdit(): void {

    this.ndaValidityEditValue =
      this.convertToInputDate(
        this.ndaValidityOriginalValue
      );

    this.isEditingNdaValidity =
      false;

    this.errorMessage = '';
  }


  /* =====================================================
     DATE → INPUT FORMAT
  ===================================================== */

  private convertToInputDate(
    date: string
  ): string {

    if (!date) {

      return '';
    }


    /*
     * If backend returns:
     *
     * 2027-04-05T00:00:00
     *
     * simply take the date part.
     */
    if (
      /^\d{4}-\d{2}-\d{2}/.test(date)
    ) {

      return date.substring(
        0,
        10
      );
    }


    const parsedDate =
      new Date(date);


    if (
      isNaN(
        parsedDate.getTime()
      )
    ) {

      return '';
    }


    const year =
      parsedDate.getFullYear();

    const month =
      String(
        parsedDate.getMonth() + 1
      ).padStart(
        2,
        '0'
      );

    const day =
      String(
        parsedDate.getDate()
      ).padStart(
        2,
        '0'
      );


    return `${year}-${month}-${day}`;
  }


  /* =====================================================
     INPUT → DISPLAY FORMAT
  ===================================================== */

  private formatInputDate(
    date: string
  ): string {

    if (!date) {

      return '';
    }


    const [
      year,
      month,
      day
    ] = date.split('-');


    return `${day}-${month}-${year}`;
  }

}