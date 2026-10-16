import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { QrScannerService } from '../../core/services/qr-scanner.service';

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './qr-scanner.html',
  styleUrl: './qr-scanner.css'
})
export class QrScannerComponent {

  scanResult = '';
  message = '';
  errorMessage = '';
  isProcessing = false;

  constructor(private qrScannerService: QrScannerService) {}

  onCodeScanned(token: string): void {
    if (!token || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.scanResult = token;
    this.message = '';
    this.errorMessage = '';

    this.qrScannerService.processQrScan(token).subscribe({
      next: (response) => {
        this.message = `${response.message} (${response.action})`;
        this.isProcessing = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message ?? 'QR scan failed. Please try again.';
        this.isProcessing = false;
      }
    });
  }


  testQrScan(): void {
  const token = prompt('Enter the actual QR token');

  if (!token) {
    return;
  }

  this.onCodeScanned(token.trim());
}
}