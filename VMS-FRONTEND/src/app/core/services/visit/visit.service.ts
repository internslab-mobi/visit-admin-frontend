import { Injectable, inject } from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';
import {
  RegistrationRequest,
  RegistrationResponse
} from '../../models/registration/registration.model';
//import { VisitResponse } from '../../models/visit/visit.model';

@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/api/visits`;

  register(request: RegistrationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      this.apiUrl,
      request
    );
  }


  //   getVisitsByVisitorEmail(
  //   email: string
  // ): Observable<VisitResponse[]> {

  //   const params = new HttpParams()
  //     .set('visitorEmail', email);

  //   return this.http.get<VisitResponse[]>(
  //     this.apiUrl,
  //     { params }
  //   );
  // }
}