import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;
  passwordChanged = false;

  onSubmit(form: NgForm): void {
    if (this.isLoading || this.passwordChanged) {
      return;
    }

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'New password and confirmation do not match.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmNewPassword,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.passwordChanged = true;
          this.successMessage = response.message;
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';

          // Do not treat the first-login session as a normal session.
          this.authService.clearSession();
          this.cdr.markForCheck();
        },
        error: (error) => {
          if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to the authentication server.';
          } else if (error.status === 401 || error.status === 403) {
            this.errorMessage =
              'Your session has expired or password change is not authorized. Please sign in again.';
          } else if (error.status === 400) {
            this.errorMessage =
              error.error?.message ??
              'Please check your current password and new password.';
          } else {
            this.errorMessage =
              error.error?.message ??
              'Unable to change your password. Please try again.';
          }

          this.cdr.markForCheck();
        },
      });
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}