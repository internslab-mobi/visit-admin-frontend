import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';

import {
  RegistrationRequest,
  RegistrationResponse
} from '../../models/registration/registration.model';

import { VisitDetailResponse } from '../../models/visit/visit-detail.model';


export interface VisitDashboardResponse {

  visitId: string;
  visitReference: string;

  visitorId: string;
  visitorName: string;
  visitorEmail: string;
  visitorMobile: string;
  companyName: string;

  visitorType: string;

  purpose: string;
  hostName: string | null;

  lastVisit: string;

  status: string;
}


@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/api/visits`;


  register(
    request: RegistrationRequest
  ): Observable<RegistrationResponse> {

    return this.http.post<RegistrationResponse>(
      this.apiUrl,
      request
    );
  }


  getDashboardVisits(
  sortDirection: 'ASC' | 'DESC',
  sortBy: 'id' | 'name' | 'company' | 'visitDate'
): Observable<VisitDashboardResponse[]> {
  return this.http.get<VisitDashboardResponse[]>(
    this.apiUrl,
    {
      params: {
        sortDirection,
        sortBy
      }
    }
  );
}

  getVisitDetails(
      visitId: string
    ): Observable<VisitDetailResponse> {
      return this.http.get<VisitDetailResponse>(
        `${this.apiUrl}/${visitId}`
      );
    }

  getVisitorPhoto(visitorId: string): Observable<Blob> {
    return this.http.get(
      `${API_CONFIG.BASE_URL}/api/documents/visitor/${encodeURIComponent(visitorId)}/photo`,
      {
        responseType: 'blob'
      }
    );
  }

    checkIn(
      visitId: string,
      request: {
        aadharNumber?: string;
        panNumber?: string;
        passportNumber?: string;
      },
      photo: File
    ): Observable<VisitDetailResponse> {

      const formData = new FormData();

      formData.append(
        'request',
        new Blob(
          [JSON.stringify(request)],
          { type: 'application/json' }
        )
      );

      formData.append(
        'photo',
        photo
      );

      return this.http.patch<VisitDetailResponse>(
        `${this.apiUrl}/${visitId}/check-in`,
        formData
      );
    }

    verifyIdentity(
        visitId: string,
        request: {
          aadharNumber?: string;
          panNumber?: string;
          passportNumber?: string;
        }
      ): Observable<void> {
        return this.http.post<void>(
          `${this.apiUrl}/${visitId}/verify-identity`,
          request
        );
      }

    checkOut(
       visitId: string
      ): Observable<VisitDetailResponse> {

        return this.http.patch<VisitDetailResponse>(
          `${this.apiUrl}/${visitId}/check-out`,
          {}
        );
      }

}