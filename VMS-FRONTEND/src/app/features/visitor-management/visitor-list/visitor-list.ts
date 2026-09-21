import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  VisitService,
  VisitDashboardResponse
} from '../../../core/services/visit/visit.service';


interface VisitorRecord {

  id: string;

  name: string;
  email: string;
  mobile: string;

  visitorType: string;

  company: string;

  status: string;

  visitDate: string;
}


@Component({
  selector: 'app-visitor-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './visitor-list.html',
  styleUrl: './visitor-list.css'
})
export class VisitorListComponent implements OnInit {

  private readonly visitService = inject(VisitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);


  visitorRecords: VisitorRecord[] = [];


  searchText = '';
  selectedVisitorType = '';
  selectedStatus = '';
  selectedDate = '';

  currentPage = 1;
  pageSize = 10;


  ngOnInit(): void {

    this.loadVisitors();

  }


  private loadVisitors(): void {

    this.visitService.getDashboardVisits()
      .subscribe({

        next: (visits) => {
          console.log('API RESPONSE:',visits);

          this.visitorRecords =
            visits.map(visit => this.mapToVisitorRecord(visit));

          console.log('VISITOR RECORDS:',this.visitorRecords);
          this.changeDetectorRef.markForCheck();
        },

        error: (error) => {

          console.error(
            'Failed to load visitors:',
            error
          );

        }

      });

  }


  private mapToVisitorRecord(
    visit: VisitDashboardResponse
  ): VisitorRecord {

    return {

      id: visit.visitId,

      name: visit.visitorName,

      email: visit.visitorEmail,

      mobile: visit.visitorMobile,

      visitorType: visit.visitorType,

      company: visit.companyName,

      status: visit.status,

      visitDate: visit.lastVisit

    };

  }


  get filteredVisitors(): VisitorRecord[] {

    return this.visitorRecords.filter(visitor => {

      const search =
        this.searchText
          .toLowerCase()
          .trim();


      const matchesSearch =
        !search ||
        visitor.name.toLowerCase().includes(search) ||
        visitor.email.toLowerCase().includes(search) ||
        visitor.mobile.includes(search) ||
        visitor.id.toLowerCase().includes(search);


      const matchesVisitorType =
        !this.selectedVisitorType ||
        visitor.visitorType === this.selectedVisitorType;


      const matchesStatus =
        !this.selectedStatus ||
        visitor.status === this.selectedStatus;


      const matchesDate =
        !this.selectedDate ||
        visitor.visitDate === this.selectedDate;


      return (
        matchesSearch &&
        matchesVisitorType &&
        matchesStatus &&
        matchesDate
      );

    });

  }

  get paginatedVisitors(): VisitorRecord[] {
  const startIndex = (this.currentPage - 1) * this.pageSize;

  return this.filteredVisitors.slice(
    startIndex,
    startIndex + this.pageSize
  );
}

get totalPages(): number {
  return Math.ceil(
    this.filteredVisitors.length / this.pageSize
  );
}

get startRecord(): number {
  if (this.filteredVisitors.length === 0) {
    return 0;
  }

  return (this.currentPage - 1) * this.pageSize + 1;
}

get endRecord(): number {
  return Math.min(
    this.currentPage * this.pageSize,
    this.filteredVisitors.length
  );
}

goToPage(page: number): void {
  if (page < 1 || page > this.totalPages) {
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

  get totalVisitors(): number {
  return this.visitorRecords.length;
}

get todayVisits(): number {
  const today = new Date().toISOString().split('T')[0];

  return this.visitorRecords.filter(
    visitor => visitor.visitDate === today
  ).length;
}

get checkedInVisitors(): number {
  return this.visitorRecords.filter(
    visitor => visitor.status === 'CHECKED_IN'
  ).length;
}


  getStatusLabel(status: string): string {

    switch (status) {

      case 'CHECKED_IN':
        return 'Checked In';

      case 'CHECKED_OUT':
        return 'Checked Out';

      case 'NO_SHOW':
        return 'No Show';

      case 'CANCELLED':
        return 'Cancelled';

      case 'REGISTERED':
        return 'Registered';

      default:
        return status;

    }

  }

  onFilterChange(): void {
  this.currentPage = 1;
  }


  clearFilters(): void {
  this.searchText = '';
  this.selectedVisitorType = '';
  this.selectedStatus = '';
  this.selectedDate = '';

  this.currentPage = 1;
}

}