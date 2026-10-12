import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';


export interface NdaDocumentResponse {
  documentId: string;
  documentPath: string;
  createdAt: string | null;
  validFrom: string | null;
  validUntil: string | null;
    overwrittenBy: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NdaDocumentService {

  private readonly http = inject(HttpClient);

  private readonly ndaApiUrl =
    `${API_CONFIG.BASE_URL}/api/nda`;

  private readonly documentApiUrl =
    `${API_CONFIG.BASE_URL}/api/documents`;


  getLatestNda(
    visitorId: string
  ): Observable<NdaDocumentResponse> {

    return this.http.get<NdaDocumentResponse>(
      `${this.ndaApiUrl}/${visitorId}/latest`
    );

  }


  getNdaHistory(
    visitorId: string
  ): Observable<NdaDocumentResponse[]> {

    return this.http.get<NdaDocumentResponse[]>(
      `${this.ndaApiUrl}/${visitorId}/history`
    );

  }


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


  getNdaDownloadUrl(
    visitorId: string
  ): string {

    return `${this.documentApiUrl}/${visitorId}/nda/download`;

  }


  getDocumentViewUrl(
    documentId: string
  ): string {

    return `${this.documentApiUrl}/${documentId}/view`;

  }

}