import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { BlacklistService } from '../../../core/services/blacklist/blacklist.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitorService} from '../../../core/services/visitor/visitor.service';
import { VisitorEditResponse, VisitorEditVisitor, VisitorVisit, VisitorDocument } from '../../../core/models/visitor/visitor.model';
import { VisitDurationComponent } from '../../../shared/components/visit-duration/visit-duration';
import {DocumentService} from '../../../core/services/document/document.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { BlacklistComponent } from '../../../shared/components/blacklist/blacklist';
import { ViewChild } from '@angular/core';
@Component({
  selector: 'app-visitor-edit',

  standalone: true,

  imports: [
    FormsModule,
    VisitDurationComponent,
    BlacklistComponent
  ],

  templateUrl: './visitor-edit.html',

  styleUrl: './visitor-edit.css'
})
export class VisitorEditComponent implements OnInit {



  private readonly visitorService =
    inject(VisitorService);

    //activated router gets the detail from current router
  private readonly route =
    inject(ActivatedRoute);
//router helps to navigate to another page/router
  private readonly router =
    inject(Router);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

    private readonly blacklistService = inject(BlacklistService);
private readonly authService = inject(AuthService);

private readonly documentService =
  inject(DocumentService);



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

isAdmin = false;


  firstName = '';

  lastName = '';

  email = '';

  mobileNumber = '';

  companyName = '';



  photoUrl = '';


  
@ViewChild(BlacklistComponent)
blacklistComponent!: BlacklistComponent;

  ngOnInit(): void {

    this.isAdmin =
  this.authService.currentUser()?.role === 'ADMIN';

    this.visitorId =
      this.route.snapshot.paramMap.get('visitorId') ?? '';

    if (!this.visitorId) {

      this.errorMessage =
        'Visitor ID is missing.';

      this.loading = false;

      return;
    }

    
    this.loadVisitor();

    this.loadDocuments();
  }



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


          this.photoUrl =
            this.documentService
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
  this.documentService.getVisitorDocuments(this.visitorId).subscribe({
    next: (documents) => {
      this.documents = documents ?? [];
      this.changeDetectorRef.markForCheck();
    },
    error: (error) => {
      console.error('Failed to load visitor documents:', error);
      this.documents = [];
      this.changeDetectorRef.markForCheck();
    }
  });
}




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


  


  cancel(): void {

    this.router.navigate([
      '/admin/visitors'
    ]);

  }


  



  




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


  formatDate(
  value: string | null,
  includeTime = false
): string {
  if (!value) {
    return '-';
  }

  if (includeTime) {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const datePart = value.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}



  viewDocument(document: VisitorDocument): void {

  const documentUrl =
    this.documentService.getDocumentViewUrl(
      document.documentId
    );

  window.open(
    documentUrl,
    '_blank'
  );

}
 
addToBlacklist(): void {
  if (!this.visitorId || this.blacklisted) {
    return;
  }

  const reason = window.prompt('Enter the reason for blacklisting this visitor:');

  if (reason === null) {
    return;
  }

  const trimmedReason = reason.trim();

  if (trimmedReason.length < 3 || trimmedReason.length > 255) {
    this.errorMessage =
      'Blacklist reason must be between 3 and 255 characters.';
    this.successMessage = '';
    return;
  }

  const userId = this.authService.currentUser()?.userId;

  if (!userId) {
    this.errorMessage = 'Unable to identify the logged-in user.';
    this.successMessage = '';
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  const request = {
    reason: trimmedReason,
    createdBy: userId
  };

  this.blacklistService
    .addExistingVisitorToBlacklist(this.visitorId, request)
    .subscribe({
      next: (response) => {
        this.blacklist = response;
        this.blacklisted = true;
        this.successMessage =
          'Visitor has been added to the blacklist successfully.';
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Failed to add visitor to blacklist:', error);
        this.errorMessage =
          error?.error?.message ??
          'Failed to add visitor to blacklist.';
        this.changeDetectorRef.markForCheck();
      }
    });
}

 

removeFromBlacklist(): void {
  if (!this.blacklist?.id) {
    this.errorMessage = 'Blacklist record was not found.';
    return;
  }

  const confirmed = window.confirm(
    'Are you sure you want to remove this visitor from the blacklist?'
  );

  if (!confirmed) {
    return;
  }

  const userId = this.authService.currentUser()?.userId;

  if (!userId) {
    this.errorMessage = 'Unable to identify the logged-in user.';
    this.successMessage = '';
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';

  this.blacklistService
    .removeFromBlacklist(this.blacklist.id, userId)
    .subscribe({
      next: () => {
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

onBlacklistChanged(
  event: {
    blacklisted: boolean;
    blacklist: VisitorEditResponse['blacklist'];
  }
): void {
  this.blacklisted = event.blacklisted;
  this.blacklist = event.blacklist;
  this.changeDetectorRef.markForCheck();
}
}