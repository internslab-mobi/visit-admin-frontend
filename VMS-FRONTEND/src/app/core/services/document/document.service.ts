import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';
import { DocumentResponse } from '../../models/document/DocumentResponse';
@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/api/documents`;

    getVisitorDocuments(
    visitorId: string
  ): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(
      `${this.apiUrl}/visitor/${encodeURIComponent(visitorId)}`
    );
  }

  getDocumentViewUrl(documentId: string): string {
    return `${this.apiUrl}/${encodeURIComponent(documentId)}/view`;
  }

  getVisitorPhotoUrl(visitorId: string): string {
    return `${this.apiUrl}/visitor/${encodeURIComponent(visitorId)}/photo`;
  }
}