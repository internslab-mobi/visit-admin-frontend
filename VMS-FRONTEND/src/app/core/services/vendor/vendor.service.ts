import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';


/* =========================================================
   VENDOR RESPONSE
========================================================= */

export interface VendorResponse {

  id: string;

  visitorId: string;

  firstName: string;

  lastName: string;

  email: string;

  mobileNumber: string;

  companyName: string | null;

  validity: string | null;

}


/* =========================================================
   SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/api/vendors`;


  /* =======================================================
     GET ALL VENDORS
  ======================================================= */

  getVendors(): Observable<VendorResponse[]> {

    return this.http.get<VendorResponse[]>(
      this.apiUrl
    );

  }


  /* =======================================================
     GET VENDOR BY ID
  ======================================================= */

  getVendorById(
    vendorId: string
  ): Observable<VendorResponse> {

    return this.http.get<VendorResponse>(
      `${this.apiUrl}/${vendorId}`
    );

  }

}