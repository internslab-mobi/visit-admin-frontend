import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Department } from '../../models/department/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private departments: Department[] = [
    {
      id: 1,
      name: 'Human Resources',
      description: 'HR and employee management',
      isActive: true
    },
    {
      id: 2,
      name: 'Information Technology',
      description: 'Technology and software development',
      isActive: true
    },
    {
      id: 3,
      name: 'Finance',
      description: 'Finance and accounting',
      isActive: true
    },
    {
      id: 4,
      name: 'Administration',
      description: 'Office administration and facilities',
      isActive: true
    },
    {
      id: 5,
      name: 'Sales',
      description: 'Sales and business development',
      isActive: true
    },
    {
      id: 6,
      name: 'Marketing',
      description: 'Marketing and communications',
      isActive: true
    },
    {
      id: 7,
      name: 'Engineering',
      description: 'Engineering and technical operations',
      isActive: true
    },
    {
      id: 8,
      name: 'Operations',
      description: 'Business and operational activities',
      isActive: true
    }
  ];

  /**
   * Get all active departments.
   */
  getDepartments(): Observable<Department[]> {
    return of(
      this.departments.filter(department => department.isActive)
    );
  }

  /**
   * Get department by ID.
   */
  getDepartmentById(id: number): Observable<Department | null> {
    const department = this.departments.find(
      department => department.id === id
    );

    return of(department ?? null);
  }
}