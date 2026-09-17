

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Visitor } from '../../models/visitor/visitor.model';
import { API_CONFIG } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/api/visitors`;

  /**
   * Create a new visitor
   */
  createVisitor(
    visitorData: Omit<Visitor, 'id' | 'cooldownUntil'>
  ): Observable<Visitor> {

    return this.http.post<Visitor>(
      this.apiUrl,
      visitorData
    );
  }
}