
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChildren('otpBox')
  private otpBoxes!: QueryList<ElementRef<HTMLInputElement>>;

  step: 'email' | 'otp' = 'email';

  email = '';
  otp = '';
  otpDigits: string[] = Array(6).fill('');
  otpBoxIndexes = [0, 1, 2, 3, 4, 5];

  isLoading = false;
  errorMessage = '';

  get maskedEmail(): string {
    const email = this.email.trim();
    const atIndex = email.lastIndexOf('@');

    if (atIndex <= 0) {
      return email;
    }

    const localPart = email.substring(0, atIndex);
    const domain = email.substring(atIndex + 1);
    const visibleCharacters = Math.min(2, localPart.length);

    const maskedLocalPart =
      localPart.substring(0, visibleCharacters) +
      '*'.repeat(Math.max(4, localPart.length - visibleCharacters));

    return `${maskedLocalPart}@${domain}`;
  }

  onSubmitEmail(form: NgForm): void {
    if (this.isLoading) return;

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService
      .requestPasswordReset({ email: this.email.trim() })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.otp = '';
          this.otpDigits = Array(6).fill('');
          this.errorMessage = '';
          this.step = 'otp';
          this.cdr.detectChanges();
        },
        error: (error) => {
          if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please try again.';
          } else if (error.status === 429) {
            this.errorMessage =
              error.error?.message ??
              'Too many requests. Please try again later.';
          } else {
            this.errorMessage =
              'We could not process your request. Please try again later.';
          }

          this.cdr.detectChanges();
        },
      });
  }

  onOtpInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);

    input.value = digit;
    this.otpDigits[index] = digit;
    this.otp = this.otpDigits.join('');
    this.errorMessage = '';

    if (digit && index < 5) {
      this.focusOtpBox(index + 1);
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      if (!this.otpDigits[index] && index > 0) {
        event.preventDefault();
        this.otpDigits[index - 1] = '';
        this.otp = this.otpDigits.join('');
        this.focusOtpBox(index - 1);
      } else {
        this.otpDigits[index] = '';
        this.otp = this.otpDigits.join('');
      }

      this.errorMessage = '';
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusOtpBox(index - 1);
    }

    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusOtpBox(index + 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') ?? '';
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);

    this.otpDigits = Array.from(
      { length: 6 },
      (_, index) => digits[index] ?? '',
    );

    this.otp = this.otpDigits.join('');
    this.errorMessage = '';

    if (digits.length > 0) {
      this.focusOtpBox(Math.min(digits.length - 1, 5));
    }

    this.cdr.detectChanges();
  }

  private focusOtpBox(index: number): void {
    this.otpBoxes.get(index)?.nativeElement.focus();
  }

  onVerifyOtp(form: NgForm): void {
    if (this.isLoading) return;

    if (!/^\d{6}$/.test(this.otp)) {
      form.control.markAllAsTouched();
      this.errorMessage =
        'Enter all six digits of the verification code.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService
      .verifyResetOtp({
        email: this.email.trim(),
        otp: this.otp,
      })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.otp = '';
          this.otpDigits = Array(6).fill('');
          this.errorMessage = '';

          this.router.navigate(['/reset-password'], {
            state: {
              resetToken: response.resetToken,
            },
          });
        },
        error: (error) => {
          if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please try again.';
          } else if (
            error.status === 400 ||
            error.status === 401
          ) {
            this.errorMessage =
              'The code is invalid or expired. Please try again.';
          } else if (error.status === 429) {
            this.errorMessage =
              'Too many attempts. Please wait before trying again.';
          } else {
            this.errorMessage =
              'We could not verify the code. Please try again later.';
          }

          this.cdr.detectChanges();
        },
      });
  }

  changeEmail(): void {
    if (this.isLoading) return;

    this.step = 'email';
    this.otp = '';
    this.otpDigits = Array(6).fill('');
    this.errorMessage = '';
  }
}