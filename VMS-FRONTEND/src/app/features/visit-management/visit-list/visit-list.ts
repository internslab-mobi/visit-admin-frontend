import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  VisitService,
  VisitDashboardResponse
} from '../../../core/services/visit/visit.service';


interface VisitRecord {

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
  selector: 'app-visit-list',
  imports: [FormsModule, RouterLink],
  templateUrl: './visit-list.html',
  styleUrl: './visit-list.css'
})
export class VisitListComponent implements OnInit {

  private readonly visitService = inject(VisitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);


  visitRecords: VisitRecord[] = [];


  searchText = '';
  selectedVisitorType = '';
  selectedStatus = '';
  selectedDate = '';

  currentPage = 1;
  pageSize = 10;


  ngOnInit(): void {

    this.loadVisits();

  }


  private loadVisits(): void {

    this.visitService.getDashboardVisits()
      .subscribe({

        next: (visits) => {

          console.log('API RESPONSE:', visits);

          this.visitRecords =
            visits.map(visit => this.mapToVisitRecord(visit));

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

      mobile: visit.visitorMobile,

      visitorType: visit.visitorType,

      company: visit.companyName,

      status: visit.status,

      visitDate: visit.lastVisit

    };

  }


  get filteredVisits(): VisitRecord[] {

    return this.visitRecords.filter(visit => {

      const search =
        this.searchText
          .toLowerCase()
          .trim();


      const matchesSearch =
        !search ||
        visit.name.toLowerCase().includes(search) ||
        visit.email.toLowerCase().includes(search) ||
        visit.mobile.includes(search) ||
        visit.id.toLowerCase().includes(search);


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
        matchesSearch &&
        matchesVisitorType &&
        matchesStatus &&
        matchesDate
      );

    });

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


  get totalVisits(): number {

    return this.visitRecords.length;

  }


  get todayVisits(): number {

    const today =
      new Date().toISOString().split('T')[0];

    return this.visitRecords.filter(
      visit => visit.visitDate === today
    ).length;

  }


  get checkedInVisits(): number {

    return this.visitRecords.filter(
      visit => visit.status === 'CHECKED_IN'
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
