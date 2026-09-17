
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../../environments/environment.dev';
@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private readonly http = inject(HttpClient);

   private readonly apiUrl = `${API_CONFIG.BASE_URL}/api/visits`;

  createVisit(request: RegistrationRequest): Observable<RegistrationResponse> {
  return this.http.post<RegistrationResponse>(
    this.apiUrl,
    request
  );
}
}

/**
 * Request sent to the backend
 */
export interface RegistrationRequest {
  registrationType: string;
  visitorType: string;

  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string;

  purpose: string;
  hostId: number;

  visitDate: string;
  expectedArrivalTime: string;
  expectedDepartureTime: string;

  remarks?: string | null;

  proofType?: string | null;
  proofNumber?: string | null;
}

/**
 * Response returned by the backend
 */
export interface RegistrationResponse {
  visitId: number;
  visitReference: string;

  visitorId: number;

  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string;

  visitorType: string;
  registrationType: string;

  purpose: string;

  hostId: number;
  departmentId: number | null;

  expectedArrivalAt: string;
  expectedDepartureAt: string;

  remarks: string | null;

  status: string;

  message: string;
}