import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';

import { BlacklistService } from '../../core/services/blacklist/blacklist.service';
import { BlacklistResponse } from '../../core/models/blacklist/blacklist.model';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-blacklist-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './blacklist-details.html',
  styleUrl: './blacklist-details.css',
})
export class BlacklistDetails implements OnInit {

  // Actual blacklist record from backend
  blacklist: BlacklistResponse | null = null;

  get isAdmin(): boolean {
  return this.authService.currentUser()?.role === 'ADMIN';
  }
  showRevokeConfirmation = false;

  isLoading = true;
  errorMessage = '';
  showSuccessToast = false;

  constructor(
  private route: ActivatedRoute,
  private blacklistService: BlacklistService,
  private authService: AuthService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage = 'Blacklist ID is missing from the route.';
      this.isLoading = false;
      return;
    }

    this.loadBlacklist(id);
  }

  loadBlacklist(id: string): void {

  this.blacklistService.getBlacklistById(id).subscribe({

    next: (response) => {

      console.log('Blacklist response:', response);

      this.blacklist = response;
      this.isLoading = false;

      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error('Error loading blacklist record:', error);

      this.errorMessage = 'Unable to load blacklist details.';
      this.isLoading = false;

      this.cdr.detectChanges();
    }

  });

}

  openRevokeConfirmation(): void {
    this.showRevokeConfirmation = true;
  }

  cancelRevoke(): void {
    this.showRevokeConfirmation = false;
  }

  // Backend revoke integration will be implemented next
  confirmRevoke(): void {

  if (!this.blacklist) {
    return;
  }

  const currentUser = this.authService.currentUser();

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return;
  }

  this.blacklistService.removeFromBlacklist(
    this.blacklist.id,
    currentUser.userId
  ).subscribe({

    next: (response) => {

  console.log('Blacklist revoked successfully:', response);
  // alert('Blacklist revoked successfully');

  this.blacklist = response;
  this.showRevokeConfirmation = false;
  this.showSuccessToast = true;

  this.cdr.detectChanges();

  setTimeout(() => {
    this.showSuccessToast = false;
    this.cdr.detectChanges();
  }, 3000);
},

    error: (error) => {

      console.error(
        'Failed to revoke blacklist:',
        error
      );

      this.showRevokeConfirmation = false;

      this.cdr.detectChanges();
    }

  });
}
}