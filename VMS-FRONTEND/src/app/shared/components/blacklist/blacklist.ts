
import {Component,Input,Output,EventEmitter,ChangeDetectorRef,inject} from '@angular/core';
import { BlacklistService } from '../../../core/services/blacklist/blacklist.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { VisitorEditResponse } from '../../../core/models/visitor/visitor.model';

@Component({
  selector: 'app-blacklist',
  standalone: true,
  templateUrl: './blacklist.html',
  styleUrl: './blacklist.css'
})
export class BlacklistComponent {
  private readonly blacklistService = inject(BlacklistService);
  private readonly authService = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input({ required: true }) visitorId = '';
  @Input() blacklisted = false;
  @Input() blacklist: VisitorEditResponse['blacklist'] = null;
  @Input() isAdmin = false;
@Input() vendor: { vendorId: string } | null = null;
  @Output() blacklistChanged =
    new EventEmitter<{
      blacklisted: boolean;
      blacklist: VisitorEditResponse['blacklist'];
    }>();

  errorMessage = '';
  successMessage = '';

  
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

  this.clearMessages();

  this.blacklistService
    .addExistingVisitorToBlacklist(this.visitorId, {
      reason: trimmedReason,
      createdBy: userId
    })
    .subscribe({
      next: (response) => {
        this.blacklisted = true;
        this.blacklist = response;
        this.successMessage =
          'Visitor has been added to the blacklist successfully.';

        this.blacklistChanged.emit({
          blacklisted: true,
          blacklist: response
        });

        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.handleBlacklistError(error, 'add');
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

  this.clearMessages();

  this.blacklistService
    .removeFromBlacklist(this.blacklist.id, userId)
    .subscribe({
      next: () => {
        this.blacklisted = false;
        this.blacklist = null;
        this.successMessage =
          'Visitor has been removed from the blacklist successfully.';

        this.blacklistChanged.emit({
          blacklisted: false,
          blacklist: null
        });

        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.handleBlacklistError(error, 'remove');
      }
    });
}

private clearMessages(): void {
  this.errorMessage = '';
  this.successMessage = '';
}

private handleBlacklistError(
  error: any,
  action: 'add' | 'remove'
): void {
  const defaultMessage =
    action === 'add'
      ? 'Failed to add visitor to blacklist.'
      : 'Failed to remove visitor from blacklist.';

  console.error(defaultMessage, error);

  this.errorMessage = error?.error?.message ?? defaultMessage;
  this.successMessage = '';
  this.changeDetectorRef.markForCheck();
}


formatDate(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

showAddButton(): boolean {
  return this.isAdmin && !this.vendor && !this.blacklisted;
}
}

