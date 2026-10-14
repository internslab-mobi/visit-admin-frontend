import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { VisitService, VisitDashboardResponse } from '../../../core/services/visit/visit.service';

interface VisitRecord {

  id: string;
  name: string;
  email: string;
  visitReference: string;
  mobile: string;
  visitorType: string;
  status: string;
  visitDate: string;
}

type VisitSummaryFilter = 'TODAY' | 'UPCOMING' | 'ON_PREMISES';

@Component({
  selector: 'app-visit-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './visit-list.html',
  styleUrl: './visit-list.css',
})
export class VisitListComponent implements OnInit {

  private readonly visitService = inject(VisitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  selectedSummaryFilter: VisitSummaryFilter = 'TODAY';
  visitRecords: VisitRecord[] = [];

  searchText = '';
  selectedVisitorType = '';
  selectedStatus = '';
  selectedDate = '';

  currentPage = 1;
  pageSize = 10;

  sortDirection: 'ASC' | 'DESC' = 'DESC';
  sortBy: 'id' | 'name' | 'visitDate' = 'id';
  
  ngOnInit(): void {
    this.loadVisits();
  }

  private loadVisits(): void {

  this.visitService.getDashboardVisits(
  this.sortDirection,
  this.sortBy
)
      .subscribe({
        next: (visits) => {
          console.log('VISIT API RESPONSE:', visits);
          this.visitRecords = visits
  .filter(visit =>
    visit.status === 'REGISTERED' ||
    visit.status === 'CHECKED_IN'
  )
  .map(visit => this.mapToVisitRecord(visit));

          console.log('VISIT RECORDS:', this.visitRecords);

          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load visits:',
            error
          );
        }
      });
  }


  private mapToVisitRecord(
    visit: VisitDashboardResponse
  ): VisitRecord {

    return {

      id: visit.visitId,
      name: visit.visitorName,
      email: visit.visitorEmail,
      visitReference: visit.visitReference,
      mobile: visit.visitorMobile,
      visitorType: visit.visitorType,
      status: visit.status,
      visitDate: visit.lastVisit
    };

  }


  get filteredVisits(): VisitRecord[] {
  const search = this.searchText.trim().toLowerCase();
  const today = this.getLocalToday();

  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const tomorrow = [
    tomorrowDate.getFullYear(),
    String(tomorrowDate.getMonth() + 1).padStart(2, '0'),
    String(tomorrowDate.getDate()).padStart(2, '0')
  ].join('-');

  const filtered = this.visitRecords.filter(visit => {
    const visitDate = this.getVisitDateOnly(visit.visitDate);

    const matchesSummary =
      (
        this.selectedSummaryFilter === 'TODAY' &&
        visitDate === today
      ) ||
      (
        this.selectedSummaryFilter === 'UPCOMING' &&
        visit.status === 'REGISTERED' &&
        visitDate >= tomorrow
      ) ||
      (
        this.selectedSummaryFilter === 'ON_PREMISES' &&
        visit.status === 'CHECKED_IN'
      );

        const matchesSearch =
          !search ||
          (visit.name ?? '').toLowerCase().includes(search) ||
          (visit.email ?? '').toLowerCase().includes(search) ||
          (visit.visitReference ?? '').toLowerCase().includes(search) ||
          (visit.mobile ?? '').includes(search) ||
          (visit.id ?? '').toLowerCase().includes(search);

        const matchesVisitorType =
          !this.selectedVisitorType ||
          visit.visitorType === this.selectedVisitorType;

        const matchesStatus =
          !this.selectedStatus ||
          visit.status === this.selectedStatus;

        const matchesDate =
          !this.selectedDate ||
          visit.visitDate === this.selectedDate;

        return (
          matchesSummary &&
          matchesSearch &&
          matchesVisitorType &&
          matchesStatus &&
          matchesDate
        );
      });

      const direction = this.sortDirection === 'ASC' ? 1 : -1;

      return filtered.sort((a, b) => {
        let comparison = 0;

        switch (this.sortBy) {
          case 'id':
            comparison = (a.id ?? '').localeCompare(
              b.id ?? '',
              undefined,
              { numeric: true, sensitivity: 'base' }
            );
            break;

          case 'name':
            comparison = (a.name ?? '').localeCompare(
              b.name ?? '',
              undefined,
              { sensitivity: 'base' }
            );
            break;

          case 'visitDate':
            comparison = (a.visitDate ?? '').localeCompare(
              b.visitDate ?? ''
            );
            break;
        }
        return comparison * direction;
      });
    }

private getLocalToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

get minVisitDate(): string {
  return this.getLocalToday();
}

private getVisitDateOnly(date: string): string {
  return date ? date.substring(0, 10) : '';
}

  get paginatedVisits(): VisitRecord[] {

    const startIndex =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredVisits.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get totalPages(): number {
    return Math.ceil(
      this.filteredVisits.length / this.pageSize
    );
  }

  get startRecord(): number {

    if (this.filteredVisits.length === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) * this.pageSize + 1
    );
  }

  get endRecord(): number {

    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredVisits.length
    );
  }

  goToPage(page: number): void {

    if (
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }
    this.currentPage = page;
  }

  previousPage(): void {

    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {

    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  get upcomingRegistrations(): number {
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  const tomorrow = [
    tomorrowDate.getFullYear(),
    String(tomorrowDate.getMonth() + 1).padStart(2, '0'),
    String(tomorrowDate.getDate()).padStart(2, '0')
  ].join('-');

  return this.visitRecords.filter(visit =>
    visit.status === 'REGISTERED' &&
    this.getVisitDateOnly(visit.visitDate) >= tomorrow
  ).length;
}

  get todayVisits(): number {
  const today = this.getLocalToday();

  return this.visitRecords.filter(
    visit => this.getVisitDateOnly(visit.visitDate) === today
  ).length;
}

  get checkedInVisits(): number {
    return this.visitRecords.filter(
      visit => visit.status === 'CHECKED_IN'
    ).length;
  }

  getStatusLabel(status: string): string {
  switch (status) {
    case 'REGISTERED':
      return 'Registered';

    case 'CHECKED_IN':
      return 'Checked In';

    default:
      return status;
  }
}

  onFilterChange(): void {
  this.currentPage = 1;
}

  onSortChange(): void {
  this.currentPage = 1;
}

  clearFilters(): void {
    this.searchText = '';
    this.selectedVisitorType = '';
    this.selectedStatus = '';
    this.selectedDate = '';
    this.selectedSummaryFilter = 'TODAY';
    this.currentPage = 1;
  }

  onSummaryCardClick(filter: VisitSummaryFilter): void {
  this.selectedSummaryFilter = filter;
  this.currentPage = 1;
}
}
