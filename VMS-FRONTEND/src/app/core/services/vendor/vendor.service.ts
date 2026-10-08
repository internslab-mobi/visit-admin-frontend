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

export interface VendorEditResponse {
  vendor: {
    vendorId: string;
    visitorId: string;
  };

  visitor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    companyName: string | null;
    visitorType: string;
    nationality: string;
  };

  documents: {
    documentId: string;
    documentType: string;
    documentPath: string | null;
    createdAt: string | null;
  }[];

  ndas: {
    documentId: string;
    documentPath: string;
    createdAt: string | null;
    validUntil: string | null;
  }[];

  visits: {
    visitId: string;
    visitReference: string;
    visitorType: string;
    registrationType: string;
    purpose: string;
    hostId: string;
    hostName: string;
    departmentId: string;
    departmentName: string;
    expectedArrivalAt: string | null;
    expectedDepartureAt: string | null;
    checkedInAt: string | null;
    checkedOutAt: string | null;
    remarks: string | null;
    status: string;
  }[];

  blacklist: {
    id: string;
    reason: string;
    status: string;
    createdAt: string | null;
  } | null;

  blacklisted: boolean;
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
getVendorEditDetails(
  vendorId: string
): Observable<VendorEditResponse> {

  return this.http.get<VendorEditResponse>(
    `${this.apiUrl}/${vendorId}/edit`
  );

}


  /* =======================================================
     UPLOAD PROOF DOCUMENTS
  ======================================================= */

  uploadProofDocuments(
    visitorId: string,
    formData: FormData
  ): Observable<any> {

    return this.http.post(
      `${API_CONFIG.BASE_URL}/api/documents/api/proof-documents/upload/${visitorId}`,
      formData
    );

  }
}