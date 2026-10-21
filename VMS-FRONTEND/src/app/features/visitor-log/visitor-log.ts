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

  historicalStatuses = [
  { value: 'CHECKED_OUT', label: 'Checked Out' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' }
];

  search = '';
  fromDate = '';
  toDate = '';
  selectedHostId = '';
  selectedVisitorType = '';
  selectedStatus = '';

  currentPage = 0;
  pageSize = 10;

  totalElements = 0;
  totalPages = 0;

  hasSearched = false;
  loading = false;

  ngOnInit(): void {
    this.loadHosts();
    this.changeDetectorRef.detectChanges();
  }

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


  onSearchChange(): void {

    this.currentPage = 0;

    if (!this.hasAnyFilter()) {
      this.clearResults();
      return;
    }

    this.hasSearched = true;
    this.loadVisitorLog();
  }

  onFilterChange(): void {

    this.currentPage = 0;

    if (!this.hasAnyFilter()) {
      this.clearResults();
      return;
    }

    this.hasSearched = true;
    this.loadVisitorLog();
  }

  private hasAnyFilter(): boolean {

    return (
      this.search.trim() !== '' ||
      this.fromDate !== '' ||
      this.toDate !== '' ||
      this.selectedHostId !== '' ||
      this.selectedVisitorType !== '' ||
      this.selectedStatus !== ''
    );
  }

  private loadVisitorLog(): void {

    this.loading = true;

    this.visitService.getVisitorLog(
      this.search.trim(),
      this.fromDate,
      this.toDate,
      this.selectedStatus,
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

  resetFilters(): void {

    this.search = '';
    this.fromDate = '';
    this.toDate = '';
    this.selectedHostId = '';
    this.selectedVisitorType = '';
    this.selectedStatus = '';

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

  get maxAllowedDate(): string {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  get minAllowedDate(): string {
    return '';
  }

}