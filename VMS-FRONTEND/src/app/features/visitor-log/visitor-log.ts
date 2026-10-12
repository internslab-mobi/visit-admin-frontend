import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { VisitService } from '../../core/services/visit/visit.service';
import { EmployeeService } from '../../core/services/employee/employee.service';

import { VisitorLogResponse } from '../../core/models/visitor-log/visitor-log.model';
import { Employee } from '../../core/models/employee/employee.model';

@Component({
  selector: 'app-visitor-log',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './visitor-log.html',
  styleUrl: './visitor-log.css'
})
export class VisitorLogComponent implements OnInit {

  private readonly visitService = inject(VisitService);
  private readonly employeeService = inject(EmployeeService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  visitorLogs: VisitorLogResponse[] = [];

  hosts: {
    id: string;
    name: string;
  }[] = [];

  visitorTypes = [
    'VISITOR',
    'GUEST',
    'VENDOR'
  ];

  search = '';
  fromDate = '';
  toDate = '';
  selectedHostId = '';
  selectedVisitorType = '';

  currentPage = 0;
  pageSize = 10;

  totalElements = 0;
  totalPages = 0;

  hasSearched = false;
  loading = false;

  ngOnInit(): void {
    this.loadHosts();
  }

  /*
   * Load employees once so they can be used
   * in the Host filter.
   */
  private loadHosts(): void {

    this.employeeService.getEmployees().subscribe({
      next: (employees: Employee[]) => {

        this.hosts = employees.map(employee => ({
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`
        }));

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        console.error(
          'Failed to load hosts:',
          error
        );
      }
    });
  }

  /*
   * Called whenever the search text changes.
   *
   * No Enter key.
   * No Search button.
   *
   * Every change immediately reloads the visitor log.
   */
  onSearchChange(): void {

    this.currentPage = 0;

    if (!this.hasAnyFilter()) {
      this.clearResults();
      return;
    }

    this.hasSearched = true;
    this.loadVisitorLog();
  }

  /*
   * Called whenever From Date, To Date,
   * Host or Visitor Type changes.
   */
  onFilterChange(): void {

    this.currentPage = 0;

    if (!this.hasAnyFilter()) {
      this.clearResults();
      return;
    }

    this.hasSearched = true;
    this.loadVisitorLog();
  }

  /*
   * Determines whether the user has entered
   * at least one search/filter value.
   */
  private hasAnyFilter(): boolean {

    return (
      this.search.trim() !== '' ||
      this.fromDate !== '' ||
      this.toDate !== '' ||
      this.selectedHostId !== '' ||
      this.selectedVisitorType !== ''
    );
  }

  /*
   * Calls the backend with the current
   * search and filter values.
   */
  private loadVisitorLog(): void {

    this.loading = true;

    this.visitService.getVisitorLog(
      this.search.trim(),
      this.fromDate,
      this.toDate,
      '',
      this.selectedVisitorType,
      this.selectedHostId,
      this.currentPage,
      this.pageSize,
      'DESC'
    ).subscribe({

      next: (response) => {

        this.visitorLogs = response.content;

        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;

        this.loading = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {

        console.error(
          'Failed to load visitor log:',
          error
        );

        this.visitorLogs = [];
        this.totalElements = 0;
        this.totalPages = 0;

        this.loading = false;

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  /*
   * Clears the search, filters and results.
   */
  resetFilters(): void {

    this.search = '';
    this.fromDate = '';
    this.toDate = '';
    this.selectedHostId = '';
    this.selectedVisitorType = '';

    this.clearResults();
  }

  private clearResults(): void {

    this.visitorLogs = [];

    this.totalElements = 0;
    this.totalPages = 0;
    this.currentPage = 0;

    this.hasSearched = false;
    this.loading = false;

    this.changeDetectorRef.detectChanges();
  }

  /*
   * Pagination.
   *
   * Pagination only works after a search/filter
   * has produced results.
   */
  goToPage(page: number): void {

    if (
      !this.hasSearched ||
      this.loading ||
      page < 0 ||
      page >= this.totalPages
    ) {
      return;
    }

    this.currentPage = page;

    this.loadVisitorLog();
  }

  getPageNumbers(): number[] {

    return Array.from(
      { length: this.totalPages },
      (_, index) => index
    );
  }

  formatDateTime(
    value: string | null
  ): string {

    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );
  }

  formatStatus(status: string): string {

    return status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        char => char.toUpperCase()
      );
  }

}