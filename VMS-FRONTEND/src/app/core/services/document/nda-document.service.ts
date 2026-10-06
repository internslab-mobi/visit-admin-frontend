import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../../environments/environment.dev';

export interface NdaDocumentResponse {
  documentId: string;
  documentPath: string;
  createdAt: string | null;
  validUntil: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NdaDocumentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/api/documents`;

  getLatestNda(
    visitorId: string
  ): Observable<NdaDocumentResponse> {

    return this.http.get<NdaDocumentResponse>(
      `${this.apiUrl}/${visitorId}/nda`
    );
  }

  getAllNdas(
    visitorId: string
  ): Observable<NdaDocumentResponse[]> {

    return this.http.get<NdaDocumentResponse[]>(
      `${this.apiUrl}/${visitorId}/nda/all`
    );
  }

  updateNdaValidity(
    metadataId: string,
    validUntil: string
  ): Observable<NdaDocumentResponse> {

    return this.http.put<NdaDocumentResponse>(
      `${this.apiUrl}/${metadataId}/nda-validity`,
      null,
      {
        params: {
          validUntil
        }
      }
    );
  }

  uploadNda(
    visitorId: string,
    file: File,
    validUntil: string
  ): Observable<unknown> {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('validUntil', validUntil);

    return this.http.post(
      `${this.apiUrl}/${visitorId}/nda`,
      formData
    );
  }

  getNdaDownloadUrl(visitorId: string): string {

    return `${this.apiUrl}/${visitorId}/nda/download`;
  }

  getDocumentViewUrl(documentId: string): string {

    return `${this.apiUrl}/${documentId}/view`;
  }
}