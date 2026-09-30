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

}