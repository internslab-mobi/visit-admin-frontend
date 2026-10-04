import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  onSubmit(): void {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login({
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: response => {
        this.isLoading = false;

        if (response.mustChangePassword) {
          this.errorMessage =
            'Password change is required, but the password-change flow is not configured yet.';
          return;
        }

        if (
          response.role !== 'ADMIN' &&
          response.role !== 'FRONT_DESK'
        ) {
          this.errorMessage =
            'Your account does not have permission to access this application.';
          return;
        }

        this.router.navigate(['/admin/pre-registration']);
      },
      error: error => {
        this.isLoading = false;

        if (error.status === 401 || error.status === 403) {
          this.errorMessage =
            'Invalid credentials or authentication request rejected.';
        } else {
          this.errorMessage =
            'Unable to connect to the authentication server. Please try again.';
        }
      }
    });
  }
}