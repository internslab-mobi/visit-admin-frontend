import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../../environments/environment.dev';
import {
  VisitorResponse,
  VisitorEditResponse,
  VisitorEditVisitor,
  UpdateVisitorRequest
} from '../../models/visitor/visitor.model';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/api/visitors`;

  getVisitors(): Observable<VisitorResponse[]> {
    return this.http.get<VisitorResponse[]>(this.apiUrl);
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
}