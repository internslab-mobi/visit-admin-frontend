import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../../environments/environment.dev';
import {
  Department,
  DepartmentCreateRequest
} from '../../models/department/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_CONFIG.BASE_URL}/api/departments`;

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  createDepartment(
    request: DepartmentCreateRequest
  ): Observable<Department> {

    return this.http.post<Department>(
      this.apiUrl,
      request
    );
  }
}