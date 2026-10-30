

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../environments/environment.dev';
export interface QrScanResponse {
  message: string;
  action: string;
  scannedAt: string;
}
@Injectable({
  providedIn: 'root'
})
export class QrScannerService {

  
  private readonly apiUrl =  `${API_CONFIG.BASE_URL}/api/process-scan`;

  constructor(private http: HttpClient) {}

  processQrScan(token: string): Observable<QrScanResponse> {
    const params = new HttpParams().set('token', token);

    return this.http.post<QrScanResponse>(
      this.apiUrl,
      null,
      { params }
    );
  }
}