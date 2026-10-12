import { Component, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.currentUser;

  readonly isProfileMenuOpen = signal(false);

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(open => !open);
  }

  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;

  if (!target.closest('.profile-wrapper')) {
    this.isProfileMenuOpen.set(false);
  }
}

  logout(): void {
  this.authService.logout().subscribe({
    next: () => {
      this.router.navigate(['/login']);
    },
    error: () => {
      // Even if the server logout fails,
      // remove the local authentication state.
      this.authService.clearSession();
      this.router.navigate(['/login']);
    },
  });
}
}
