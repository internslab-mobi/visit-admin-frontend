import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import {
  BlacklistService
} from '../../../core/services/blacklist/blacklist.service';
import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  VisitorService,
  VisitorEditResponse,
  VisitorEditVisitor,
  VisitorVisit,
  VisitorDocument
} from '../../../core/services/visitor/visitor.service';


@Component({
  selector: 'app-visitor-edit',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './visitor-edit.html',

  styleUrl: './visitor-edit.css'
})
export class VisitorEditComponent implements OnInit {


  /* =====================================================
     SERVICES
  ===================================================== */

  private readonly visitorService =
    inject(VisitorService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

    private readonly blacklistService = inject(BlacklistService);

  /* =====================================================
     STATE
  ===================================================== */

  visitorId = '';

  visitor: VisitorEditVisitor | null = null;

  vendor: {
    vendorId: string;
  } | null = null;

  documents: VisitorDocument[] = [];

  visits: VisitorVisit[] = [];

  blacklist: VisitorEditResponse['blacklist'] = null;

  blacklisted = false;

  loading = true;

  saving = false;

  errorMessage = '';

  successMessage = '';


  /* =====================================================
     FORM
  ===================================================== */

  firstName = '';

  lastName = '';

  email = '';

  mobileNumber = '';

  companyName = '';


  /* =====================================================
     PHOTO
  ===================================================== */

  photoUrl = '';


  /* =====================================================
     INITIALIZATION
  ===================================================== */

  ngOnInit(): void {

    this.visitorId =
      this.route.snapshot.paramMap.get(
        'visitorId'
      ) ?? '';

    if (!this.visitorId) {

      this.errorMessage =
        'Visitor ID is missing.';

      this.loading = false;

      return;
    }

    this.loadVisitor();

    this.loadDocuments();
  }


  /* =====================================================
     LOAD VISITOR
  ===================================================== */

  private loadVisitor(): void {

    this.loading = true;

    this.visitorService
      .getVisitorForEdit(this.visitorId)
      .subscribe({

        next: (response) => {

          this.visitor =
            response.visitor;

          this.vendor =
            response.vendor;

         

          this.visits =
            response.visits ?? [];

          this.blacklist =
            response.blacklist;

          this.blacklisted =
            response.blacklisted;


          /* -------------------------
             Editable fields
          ------------------------- */

          this.firstName =
            response.visitor.firstName ?? '';

          this.lastName =
            response.visitor.lastName ?? '';

          this.email =
            response.visitor.email ?? '';

          this.mobileNumber =
            response.visitor.mobileNumber ?? '';

          this.companyName =
            response.visitor.companyName ?? '';


          /* -------------------------
             Current photo
          ------------------------- */

          this.photoUrl =
            this.visitorService
              .getVisitorPhotoUrl(
                this.visitorId
              );


          this.loading = false;

          this.changeDetectorRef.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to load visitor:',
            error
          );

          this.errorMessage =
            'Failed to load visitor details.';

          this.loading = false;

          this.changeDetectorRef.markForCheck();

        }

      });

  }


private loadDocuments(): void {

  this.visitorService
    .getVisitorDocuments(this.visitorId)
    .subscribe({

      next: (documents) => {

        console.log(
          'DOCUMENT API RESPONSE:',
          documents
        );

        this.documents = documents ?? [];

        console.log(
          'DOCUMENTS ASSIGNED:',
          this.documents
        );

        this.changeDetectorRef.markForCheck();

      },

      error: (error) => {

        console.error(
          'Failed to load visitor documents:',
          error
        );

        this.documents = [];

        this.changeDetectorRef.markForCheck();

      }

    });

}

  /* =====================================================
     SAVE
  ===================================================== */

  saveChanges(): void {

    if (this.saving) {
      return;
    }


    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.mobileNumber.trim()
    ) {

      this.errorMessage =
        'Please fill all required fields.';

      return;
    }


    this.saving = true;

    this.errorMessage = '';

    this.successMessage = '';


    const request = {

      firstName:
        this.firstName.trim(),

      lastName:
        this.lastName.trim(),

      email:
        this.email.trim(),

      mobileNumber:
        this.mobileNumber.trim(),

      companyName:
        this.companyName.trim() || null

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
            'Visitor details updated successfully.';

          if (this.visitor) {

            this.visitor = {

              ...this.visitor,

              ...updatedVisitor

            };

          }

          this.changeDetectorRef.markForCheck();

        },

        error: (error) => {

          console.error(
            'Failed to update visitor:',
            error
          );

          this.saving = false;

          this.errorMessage =
            error?.error?.message ??
            'Failed to update visitor details.';

          this.changeDetectorRef.markForCheck();

        }

      });

  }


  /* =====================================================
     CANCEL
  ===================================================== */

  cancel(): void {

    this.router.navigate([
      '/admin/visitors'
    ]);

  }


  /* =====================================================
     DOCUMENT DISPLAY
  ===================================================== */

  


  /* =====================================================
     VISIT DISPLAY
  ===================================================== */

  getRegistrationLabel(
    type: string | null
  ): string {

    switch (type) {

      case 'PRE_REGISTRATION':
        return 'Pre-Registration';

      case 'ARRIVAL_REGISTRATION':
        return 'Arrival Registration';

      default:
        return type ?? '-';

    }

  }


  getVisitorTypeLabel(
    type: string | null
  ): string {

    switch (type) {

      case 'VISITOR':
        return 'Visitor';

      case 'GUEST':
        return 'Guest';

      case 'VENDOR':
        return 'Vendor';

      default:
        return type ?? '-';

    }

  }


  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replaceAll('_', '-');

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


  formatDate(
    value: string | null
  ): string {

    if (!value) {
      return '-';
    }

    return new Date(value)
      .toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }
      );

  }


  /* =====================================================
     DOCUMENT VIEW
  ===================================================== */

  viewDocument(document: VisitorDocument): void {

  const documentUrl =
    this.visitorService.getDocumentViewUrl(
      document.documentId
    );

  window.open(
    documentUrl,
    '_blank'
  );

}

  /* =====================================================
     BLACKLIST
  ===================================================== */

  // addToBlacklist(): void {

  //   /*
  //    * We'll connect this to your existing
  //    * blacklist API next.
  //    */

  //   console.log(
  //     'Add visitor to blacklist:',
  //     this.visitorId
  //   );

  // }

  addToBlacklist(): void {

  if (!this.visitorId || this.blacklisted) {
    return;
  }

  const reason = window.prompt(
    'Enter the reason for blacklisting this visitor:'
  );

  if (reason === null) {
    return;
  }

  if (!reason.trim()) {
    this.errorMessage = 'Blacklist reason is required.';
    this.successMessage = '';
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  const request = {
    reason: reason.trim(),
    createdBy: 'HR' // will replace this once logging is connected 
  };

  this.blacklistService
    .addExistingVisitorToBlacklist(
      this.visitorId,
      request
    )
    .subscribe({
      next: (response) => {

        console.log(
          'Visitor added to blacklist:',
          response
        );

        this.blacklist = response;
        this.blacklisted = true;

        this.successMessage =
          'Visitor has been added to the blacklist successfully.';

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {

        console.error(
          'Failed to add visitor to blacklist:',
          error
        );

        this.errorMessage =
          error?.error?.message ??
          'Failed to add visitor to blacklist.';

        this.successMessage = '';

        this.changeDetectorRef.markForCheck();
      }
    });

  // this.blacklistService
  // .addExistingVisitorToBlacklist(
  //   this.visitorId,
  //   request
  // )
  // .subscribe({
  //   next: (response) => {
  //     this.blacklist = response;
  //     this.blacklisted = true;

  //     this.successMessage =
  //       'Visitor has been added to the blacklist successfully.';

  //     this.changeDetectorRef.markForCheck();
  //   },
  //   error: (error) => {
  //     console.error(
  //       'Failed to add visitor to blacklist:',
  //       error
  //     );

  //     this.errorMessage =
  //       error?.error?.message ??
  //       'Failed to add visitor to blacklist.';

  //     this.successMessage = '';

  //     this.changeDetectorRef.markForCheck();
  //   }
  // });
}


  // removeFromBlacklist(): void {

  //   /*
  //    * We'll connect this to your existing
  //    * blacklist API next.
  //    */

  //   console.log(
  //     'Remove visitor from blacklist:',
  //     this.visitorId
  //   );

  // }

  removeFromBlacklist(): void {

  if (!this.blacklist?.id) {
    this.errorMessage =
      'Blacklist record was not found.';
    return;
  }

  const confirmed = window.confirm(
    'Are you sure you want to remove this visitor from the blacklist?'
  );

  if (!confirmed) {
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  this.blacklistService
    .removeFromBlacklist(
      this.blacklist.id,
      'HR'
    )
    .subscribe({
      next: (response) => {

        console.log(
          'Visitor removed from blacklist:',
          response
        );

        this.blacklisted = false;
        this.blacklist = null;

        this.successMessage =
          'Visitor has been removed from the blacklist successfully.';

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {

        console.error(
          'Failed to remove visitor from blacklist:',
          error
        );

        this.errorMessage =
          error?.error?.message ??
          'Failed to remove visitor from blacklist.';

        this.successMessage = '';

        this.changeDetectorRef.markForCheck();
      }
    });
}

}