import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../../environments/environment.dev';
import { DocumentResponse } from '../../models/document/DocumentResponse';

@Injectable({
  providedIn: 'root'
})
export class NdaDocumentService {

  private readonly http = inject(HttpClient);

  private readonly ndaApiUrl = `${API_CONFIG.BASE_URL}/api/nda`;

  private readonly documentApiUrl =`${API_CONFIG.BASE_URL}/api/documents`;


   getLatestNda(visitorId: string): Observable<DocumentResponse> {
    return this.http.get<DocumentResponse>(
      `${this.ndaApiUrl}/${encodeURIComponent(visitorId)}/latest`
    );
  }


   getNdaHistory(visitorId: string): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(
      `${this.ndaApiUrl}/${encodeURIComponent(visitorId)}/history`
    );
  }


   uploadNewNda(visitorId: string,file: File,validUntil: string): Observable<DocumentResponse> {
    const formData = new FormData();
//form data is a key value pair used to send data from our frontyend to backend through http client
    formData.append('ndaFile', file);
    formData.append('validUntil', validUntil);

    return this.http.post<DocumentResponse>(
      `${this.ndaApiUrl}/${encodeURIComponent(visitorId)}/upload-new`,
      formData
    );
  }
 extendNdaValidity(visitorId: string,supportingDocument: File,newValidUntil: string
  ): Observable<DocumentResponse> {
    const formData = new FormData();

    formData.append('supportingDocument', supportingDocument);
    formData.append('newValidUntil', newValidUntil);

    return this.http.post<DocumentResponse>(
      `${this.ndaApiUrl}/${encodeURIComponent(visitorId)}/extend`,
      formData
    );
  }

//visitorId: string - it defines what type of value is send to backend 
// string - it defines what type of value returns from backend 
   getNdaDownloadUrl(visitorId: string): string {
    return `${this.documentApiUrl}/${encodeURIComponent(visitorId)}/nda/download`;
  }


  //  getDocumentViewUrl(documentId: string): string {
  //   return `${this.documentApiUrl}/${encodeURIComponent(documentId)}/view`;
  // }

}