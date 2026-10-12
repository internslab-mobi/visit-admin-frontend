
/* =====================================================
   1. IMPORTS
   Angular utilities, form validation, routing and RxJS.
   ===================================================== */

import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth/auth.service';


/* =====================================================
   2. COMPONENT CONFIGURATION
   This is a standalone Angular component.
   ===================================================== */

@Component({
  selector: 'app-login',
  standalone: true,

  // FormsModule handles ngModel and NgForm.
  // RouterLink enables navigation to Forgot Password.
  imports: [FormsModule, RouterLink],

  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {

  /* ===================================================
     3. DEPENDENCY INJECTION
     Services required for login and navigation.
     =================================================== */

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);


  /* ===================================================
     4. COMPONENT STATE
     Values displayed or used by the login form.
     =================================================== */

  email = '';
  password = '';

  // Displays authentication or server errors.
  errorMessage = '';

  // Prevents duplicate submissions while login is running.
  isLoading = false;


  /* ===================================================
     5. LOGIN FORM SUBMISSION
     Validate the form before sending the API request.
     =================================================== */

  onSubmit(form: NgForm): void {

    // Prevent duplicate login requests.
    if (this.isLoading) {
      return;
    }

    // Stop submission if required fields or email format
    // are invalid. Show validation messages to the user.
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // Clear any previous authentication error.
    this.errorMessage = '';

    // Start the loading state.
    this.isLoading = true;


    /* =================================================
       6. CALL THE AUTHENTICATION SERVICE
       AuthService handles CSRF initialization and login.
       ================================================= */

    this.authService
      .login({
        email: this.email.trim(),
        password: this.password,
      })
      .pipe(

        // Always stop loading when the request completes,
        // whether it succeeds or fails.
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),

      )
      .subscribe({

        /* ===============================================
           7. SUCCESSFUL LOGIN RESPONSE
           Check first-login requirements and user role.
           =============================================== */

        next: (response) => {

          // Handle accounts that must change their password.
          if (response.mustChangePassword) {
            this.errorMessage =
              'Password change is required, but the password-change flow is not configured yet.';

            this.cdr.markForCheck();
            return;
          }

          // Only these roles may access this application.
          if (
            response.role !== 'ADMIN' &&
            response.role !== 'FRONT_DESK'
          ) {
            this.errorMessage =
              'Your account does not have permission to access this application.';

            this.cdr.markForCheck();
            return;
          }

          // Navigate after successful authentication.
          void this.router.navigate(['/admin/pre-registration']);
        },


        /* ===============================================
           8. FAILED LOGIN RESPONSE
           Convert API failures into user-friendly messages.
           =============================================== */

        error: (error) => {

          if (error.status === 0) {
            this.errorMessage =
              'Unable to connect to the authentication server. Please try again.';

          } else if (error.status === 401) {
            this.errorMessage =
              'Invalid email or password.';

          } else if (error.status === 403) {
            this.errorMessage =
              'Access denied. Please contact your administrator.';

          } else if (error.status === 429) {
            this.errorMessage =
              'Too many login attempts. Please try again later.';

          } else if (error.status >= 500) {
            this.errorMessage =
              'A server error occurred. Please try again later.';

          } else {
            this.errorMessage =
              'Unable to sign in. Please check your details and try again.';
          }

          this.cdr.markForCheck();
        },

      });
  }
}