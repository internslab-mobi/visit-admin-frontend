import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Employee } from '../../models/employee/employee.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private employees: Employee[] = [
    {
      id: 1,
      employeeId: 'EMP001',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@company.com',
      departmentId: 2,
      designation: 'Senior Software Engineer',
      isActive: true
    },
    {
      id: 2,
      employeeId: 'EMP002',
      fullName: 'Rahul Kumar',
      email: 'rahul.kumar@company.com',
      departmentId: 2,
      designation: 'Software Engineer',
      isActive: true
    },
    {
      id: 3,
      employeeId: 'EMP003',
      fullName: 'Arun Kumar',
      email: 'arun.kumar@company.com',
      departmentId: 7,
      designation: 'Technical Lead',
      isActive: true
    },
    {
      id: 4,
      employeeId: 'EMP004',
      fullName: 'Divya Nair',
      email: 'divya.nair@company.com',
      departmentId: 1,
      designation: 'HR Manager',
      isActive: true
    },
    {
      id: 5,
      employeeId: 'EMP005',
      fullName: 'Karthik Raj',
      email: 'karthik.raj@company.com',
      departmentId: 3,
      designation: 'Finance Analyst',
      isActive: true
    },
    {
      id: 6,
      employeeId: 'EMP006',
      fullName: 'Sneha Menon',
      email: 'sneha.menon@company.com',
      departmentId: 5,
      designation: 'Sales Manager',
      isActive: true
    }
  ];

  /**
   * Get all active employees.
   */
  getEmployees(): Observable<Employee[]> {
    return of(
      this.employees.filter(employee => employee.isActive)
    );
  }

  /**
   * Get employee by internal ID.
   */
  getEmployeeById(id: number): Observable<Employee | null> {
    const employee = this.employees.find(
      employee => employee.id === id
    );

    return of(employee ?? null);
  }

  /**
   * Search employees by name or employee ID.
   */
  searchEmployees(searchTerm: string): Observable<Employee[]> {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return this.getEmployees();
    }

    const results = this.employees.filter(employee =>
      employee.isActive &&
      (
        employee.fullName.toLowerCase().includes(term) ||
        employee.employeeId.toLowerCase().includes(term)
      )
    );

    return of(results);
  }
}