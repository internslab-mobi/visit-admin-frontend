
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { QrScannerService } from '../../core/services/qr-scanner.service';
import { ChangeDetectorRef } from '@angular/core';
import { inject } from '@angular/core';
@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.css'
})
export class QrScannerComponent {

  token = '';
  scanResult = '';
  message = '';
  errorMessage = '';
  scanAction = '';
  scanTime = '';
  isProcessing = false;

  private cdr=inject(ChangeDetectorRef);
  constructor(
    private qrScannerService: QrScannerService
  ) {}

  simulateScan(): void {
    const qrToken = this.token.trim();

    if (!qrToken) {
      this.errorMessage = 'Please enter a QR token.';
      return;
    }

    if (this.isProcessing) {
      return;
    }

    this.onCodeScanned(qrToken);
   
  }

  onCodeScanned(token: string): void {
    const qrToken = token?.trim();

    if (!qrToken || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.scanResult = qrToken;
    this.message = '';
    this.errorMessage = '';
    this.scanAction = '';
    this.scanTime = '';

    this.qrScannerService.processQrScan(qrToken).subscribe({
      next: (response) => {
        this.message = response.message;
        this.scanAction = response.action;
        this.scanTime = new Date().toLocaleString();

        this.token = '';
        this.isProcessing = false;
         this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {
        console.error('QR scan error:', error);

        const body = error.error;

        if (typeof body === 'string' && body.trim()) {
          this.errorMessage = body;
        } else if (body && typeof body === 'object') {
          this.errorMessage =
            body.message ??
            body.detail ??
            body.error ??
            `QR scan failed. Status: ${error.status}`;
        } else if (error.status === 0) {
          this.errorMessage =
            'Unable to connect to the server.';
        } else {
          this.errorMessage =
            error.message || 'QR scan failed. Please try again.';
        }

        this.isProcessing = false;
      }
    });
  }
}
