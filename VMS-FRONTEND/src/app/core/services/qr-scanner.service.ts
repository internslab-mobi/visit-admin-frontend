
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QrScanResponse {
  message: string;
  action: 'IN' | 'OUT';
  scannedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class QrScannerService {

  private readonly apiUrl =
    'http://localhost:8062/api/qr/process-scan';

  constructor(private readonly http: HttpClient) {}

  processQrScan(token: string): Observable<QrScanResponse> {
    const params = new HttpParams().set('token', token.trim());

    return this.http.post<QrScanResponse>(
      this.apiUrl,
      null,
      { params }
    );
  }
}
