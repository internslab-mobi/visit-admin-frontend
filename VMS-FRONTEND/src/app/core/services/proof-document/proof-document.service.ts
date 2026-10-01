import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';

export interface DocumentResponse {
  documentId: string;
  documentPath: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProofDocumentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
   `${API_CONFIG.BASE_URL}/api/documents`;


  uploadProofDocuments(
    visitorId: string,
    files: File[]
  ): Observable<DocumentResponse[]> {

    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<DocumentResponse[]>(
      `${this.apiUrl}/api/proof-documents/upload/${visitorId}`,
      formData
    );
  }
}