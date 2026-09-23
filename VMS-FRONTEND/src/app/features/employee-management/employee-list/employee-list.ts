import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Employee } from '../../../core/models/employee/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})
export class EmployeeListComponent implements OnInit {

  private readonly employeeService = inject(EmployeeService);
  private readonly cdr = inject(ChangeDetectorRef);

  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  paginatedEmployees: Employee[] = [];

  employeeName = '';
  employeeCode = '';
  department = '';
  designation = '';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.filteredEmployees = employees;

        this.updatePagination();

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load employees:', error);
      }
    });
  }

  searchEmployees(): void {
    const name = this.employeeName.trim().toLowerCase();
    const code = this.employeeCode.trim().toLowerCase();
    const department = this.department.trim().toLowerCase();
    const designation = this.designation.trim().toLowerCase();

    this.filteredEmployees = this.employees.filter(employee => {

      const fullName =
        `${employee.firstName} ${employee.lastName}`.toLowerCase();

      const matchesName =
        !name || fullName.includes(name);

      const matchesCode =
        !code || employee.id.toLowerCase().includes(code);

      const matchesDepartment =
        !department ||
        employee.department.departmentName
          .toLowerCase()
          .includes(department);

      const matchesDesignation =
        !designation ||
        employee.designation.toLowerCase().includes(designation);

      return (
        matchesName &&
        matchesCode &&
        matchesDepartment &&
        matchesDesignation
      );
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.employeeName = '';
    this.employeeCode = '';
    this.department = '';
    this.designation = '';

    this.filteredEmployees = this.employees;

    this.currentPage = 1;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(this.filteredEmployees.length / this.pageSize)
    );

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    this.paginatedEmployees =
      this.filteredEmployees.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
}

