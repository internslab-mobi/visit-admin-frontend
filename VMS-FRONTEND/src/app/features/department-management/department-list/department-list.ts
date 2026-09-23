import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DepartmentService } from '../../../core/services/department/department.service';
import { Department } from '../../../core/models/department/department.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './department-list.html',
  styleUrl: './department-list.css'
})
export class DepartmentListComponent implements OnInit {

  private readonly departmentService = inject(DepartmentService);
  private readonly cdr = inject(ChangeDetectorRef);

  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  paginatedDepartments: Department[] = [];

  departmentName = '';
  departmentCode = '';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  ngOnInit(): void {
    this.loadDepartments();
  }

  private loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.filteredDepartments = departments;

        this.updatePagination();

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load departments:', error);
      }
    });
  }

  searchDepartments(): void {
    const name = this.departmentName.trim().toLowerCase();
    const code = this.departmentCode.trim().toLowerCase();

    this.filteredDepartments = this.departments.filter(department => {

      const matchesName =
        !name ||
        department.departmentName
          .toLowerCase()
          .includes(name);

      const matchesCode =
        !code ||
        department.departmentCode
          .toLowerCase()
          .includes(code);

      return matchesName && matchesCode;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.departmentName = '';
    this.departmentCode = '';

    this.filteredDepartments = this.departments;

    this.currentPage = 1;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.max(
      1,
      Math.ceil(
        this.filteredDepartments.length / this.pageSize
      )
    );

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    const endIndex =
      startIndex + this.pageSize;

    this.paginatedDepartments =
      this.filteredDepartments.slice(startIndex, endIndex);
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