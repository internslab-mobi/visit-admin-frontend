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

}