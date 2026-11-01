import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly location = inject(Location);
  private readonly cdr = inject(ChangeDetectorRef);

  resetToken = '';

  newPassword = '';
  confirmNewPassword = '';

  showNewPassword = false;
  showConfirmPassword = false;

  isLoading = false;
  isComplete = false;
  errorMessage = '';
  successMessage = '';

  // Password policy checks

  get hasMinLength(): boolean {
    return this.newPassword.length >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.newPassword);
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.newPassword);
  }

  get hasDigit(): boolean {
    return /[0-9]/.test(this.newPassword);
  }

  get hasSpecialCharacter(): boolean {
    return /[^A-Za-z0-9\s]/.test(this.newPassword);
  }

  get isPasswordPolicyValid(): boolean {
    return (
      this.hasMinLength &&
      this.hasUppercase &&
      this.hasLowercase &&
      this.hasDigit &&
      this.hasSpecialCharacter
    );
  }

  // Password policy progress indicator

  get passwordStrength(): number {
    return [
      this.hasMinLength,
      this.hasUppercase,
      this.hasLowercase,
      this.hasDigit,
      this.hasSpecialCharacter,
    ].filter(Boolean).length;
  }

  get passwordStrengthLabel(): string {
    if (!this.newPassword) return 'Not entered';
    if (this.passwordStrength <= 2) return 'Weak';
    if (this.passwordStrength <= 4) return 'Almost there';
    return 'Meets requirements';
  }

  constructor() {
    const navigationState = this.location.getState() as {
      resetToken?: string;
    };

    this.resetToken = navigationState?.resetToken ?? '';

    if (!this.resetToken) {
      this.errorMessage =
        'Your password-reset session is missing or expired. Please request a new code.';
    }
  }

  onResetPassword(form: NgForm): void {
    if (this.isLoading || this.isComplete) return;

    // Validate required fields and minimum HTML form constraints.
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // Ensure the reset session exists.
    if (!this.resetToken) {
      this.errorMessage =
        'Your password-reset session is missing or expired. Please request a new code.';
      return;
    }

    // Enforce all five password requirements.
    if (!this.isPasswordPolicyValid) {
      this.errorMessage =
        'Your password must meet all five requirements before you can continue.';
      return;
    }

    // Ensure both password fields match.
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'The passwords do not match.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService
      .resetPassword({
        resetToken: this.resetToken,
        newPassword: this.newPassword,
        confirmNewPassword: this.confirmNewPassword,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.newPassword = '';
          this.confirmNewPassword = '';
          this.resetToken = '';
          this.isComplete = true;

          this.successMessage =
            response.message ||
            'Your password has been reset successfully. You can now log in.';

          this.errorMessage = '';
          this.cdr.detectChanges();
        },

        error: (error) => {
          if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please try again.';
          } else if (error.status === 400 || error.status === 401) {
            this.errorMessage =
              error.error?.message ??
              'The reset session has expired or the password was rejected. Please request a new code if needed.';
          } else if (error.status === 429) {
            this.errorMessage =
              'Too many requests. Please wait before trying again.';
          } else {
            this.errorMessage =
              'We could not reset your password. Please try again later.';
          }

          this.cdr.detectChanges();
        },
      });
  }
}

