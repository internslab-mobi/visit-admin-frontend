import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {

  constructor(private router: Router) {}

  getStarted(): void {
    this.router.navigate(['/admin/pre-registration']);
  }
}