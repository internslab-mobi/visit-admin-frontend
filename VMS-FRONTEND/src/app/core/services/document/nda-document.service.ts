import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';


/* =========================================================
   NDA DOCUMENT RESPONSE
========================================================= */

export interface NdaDocumentResponse {
  documentId: string;
  documentPath: string;
  createdAt: string | null;
  validFrom: string | null;
  validUntil: string | null;
    overwrittenBy: string | null;
}


/* =========================================================
   NDA DOCUMENT SERVICE
========================================================= */

@Injectable({
  providedIn: 'root'
})
export class NdaDocumentService {

  private readonly http = inject(HttpClient);

  /*
   * NDA lifecycle APIs
   */
  private readonly ndaApiUrl =
    `${API_CONFIG.BASE_URL}/api/nda`;

  /*
   * Existing document APIs
   * Used only for viewing/downloading the actual file.
   */
  private readonly documentApiUrl =
    `${API_CONFIG.BASE_URL}/api/documents`;


  /* =======================================================
     GET LATEST NDA
     
     GET /api/nda/{visitorId}/latest
  ======================================================= */

  getLatestNda(
    visitorId: string
  ): Observable<NdaDocumentResponse> {

    return this.http.get<NdaDocumentResponse>(
      `${this.ndaApiUrl}/${visitorId}/latest`
    );

  }


  /* =======================================================
     GET NDA HISTORY

     GET /api/nda/{visitorId}/history
  ======================================================= */

  getNdaHistory(
    visitorId: string
  ): Observable<NdaDocumentResponse[]> {

    return this.http.get<NdaDocumentResponse[]>(
      `${this.ndaApiUrl}/${visitorId}/history`
    );

  }


  /* =======================================================
     UPLOAD NEW NDA

     POST /api/nda/{visitorId}/upload-new

     FormData:
       ndaFile
       validUntil
  ======================================================= */

  uploadNewNda(
    visitorId: string,
    file: File,
    validUntil: string
  ): Observable<NdaDocumentResponse> {

    const formData = new FormData();

    formData.append('ndaFile', file);
    formData.append('validUntil', validUntil);

    return this.http.post<NdaDocumentResponse>(
      `${this.ndaApiUrl}/${visitorId}/upload-new`,
      formData
    );

  }


  /* =======================================================
     EXTEND NDA VALIDITY

     POST /api/nda/{visitorId}/extend

     FormData:
       supportingDocument
       newValidUntil
  ======================================================= */

  extendNdaValidity(
    visitorId: string,
    supportingDocument: File,
    newValidUntil: string
  ): Observable<NdaDocumentResponse> {

    const formData = new FormData();

    formData.append('supportingDocument', supportingDocument);
    formData.append('newValidUntil', newValidUntil);

    return this.http.post<NdaDocumentResponse>(
      `${this.ndaApiUrl}/${visitorId}/extend`,
      formData
    );

  }


  /* =======================================================
     GET NDA DOWNLOAD URL

     Existing DocumentController endpoint
  ======================================================= */

  getNdaDownloadUrl(
    visitorId: string
  ): string {

    return `${this.documentApiUrl}/${visitorId}/nda/download`;

  }


  /* =======================================================
     VIEW DOCUMENT

     Existing DocumentController endpoint
  ======================================================= */

  getDocumentViewUrl(
    documentId: string
  ): string {

    return `${this.documentApiUrl}/${documentId}/view`;

  }

}