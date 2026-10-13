import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';


export interface VisitorResponse {

  id: string;

  firstName: string;
  lastName: string;

  email: string;
  mobileNumber: string;

  companyName: string | null;

  visitorType: string | null;
  lastVisitDate: string | null;

}
export interface VisitorEditResponse {

  visitor: VisitorEditVisitor;

  vendor: VisitorVendor | null;

  documents: VisitorDocument[];

  visits: VisitorVisit[];

  blacklist: VisitorBlacklist | null;

  blacklisted: boolean;

}




export interface VisitorEditVisitor {

  id: string;

  firstName: string;
  lastName: string;

  email: string;
  mobileNumber: string;

  companyName: string | null;

  visitorType: string | null;

  nationality: string | null;

}



export interface VisitorVendor {

  vendorId: string;

}


export interface VisitorDocument {

  documentId: string;

  documentPath: string;

  createdAt: string | null;

}




export interface VisitorVisit {

  visitId: string;

  visitReference: string | null;

  visitorType: string | null;

  registrationType: string | null;

  purpose: string | null;

  hostId: string | null;

  hostName: string | null;

  departmentId: string | null;

  departmentName: string | null;

  expectedArrivalAt: string | null;

  expectedDepartureAt: string | null;

  checkedInAt: string | null;

  checkedOutAt: string | null;

  totalDurationSeconds: number | null;

  remarks: string | null;

  status: string;

  // duration:string | null;

}




export interface VisitorBlacklist {

  id: string;

  reason: string | null;

  status: string;

  createdAt: string | null;

}



export interface UpdateVisitorRequest {

  firstName: string;

  lastName: string;

  email: string;

  mobileNumber: string;

  companyName: string | null;

}




@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/api/visitors`;


  getVisitors(): Observable<VisitorResponse[]> {

    return this.http.get<VisitorResponse[]>(
      this.apiUrl
    );

  }



  getVisitorForEdit(
    visitorId: string
  ): Observable<VisitorEditResponse> {

    return this.http.get<VisitorEditResponse>(
      `${this.apiUrl}/${visitorId}/edit`
    );

  }


  updateVisitor(
    visitorId: string,
    request: UpdateVisitorRequest
  ): Observable<VisitorEditVisitor> {

    return this.http.put<VisitorEditVisitor>(
      `${this.apiUrl}/${visitorId}`,
      request
    );

  }


  getVisitorPhotoUrl(
    visitorId: string
  ): string {

    return `${API_CONFIG.BASE_URL}/api/documents/visitor/${visitorId}/photo`;

  }
getVisitorDocuments(visitorId: string): Observable<VisitorDocument[]> {
  return this.http.get<VisitorDocument[]>(
    `${API_CONFIG.BASE_URL}/api/documents/visitor/${visitorId}`
  );
}

getDocumentViewUrl(documentId: string): string {
  return `${API_CONFIG.BASE_URL}/api/documents/${documentId}/view`;
}

}