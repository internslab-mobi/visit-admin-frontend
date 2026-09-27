import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BlacklistService } from '../../core/services/blacklist/blacklist.service';
import { BlacklistResponse } from '../../core/models/blacklist/blacklist.model';

@Component({
  selector: 'app-blacklist',
  imports: [FormsModule, RouterLink],
  templateUrl: './blacklist.html',
  styleUrl: './blacklist.css',
})
export class Blacklist implements OnInit {

  blacklistRecords: BlacklistResponse[] = [];

  currentPage = 1;
  pageSize = 10;

  isLoading = false;

  visitorNameFilter = '';
  visitorIdFilter = '';
  reasonFilter = '';
  statusFilter = '';

  constructor(
    private blacklistService: BlacklistService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBlacklistRecords();
  }

  loadBlacklistRecords(): void {

    this.isLoading = true;

    this.blacklistService.getAllBlacklistRecords().subscribe({
      next: (records) => {

        this.blacklistRecords = records;
        this.currentPage = 1;
        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {

        console.error('Failed to load blacklist records:', error);

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  get filteredRecords(): BlacklistResponse[] {

    const visitorId = this.visitorIdFilter.trim().toLowerCase();
    const reason = this.reasonFilter.trim().toLowerCase();
    const status = this.statusFilter;

    return this.blacklistRecords.filter(record => {

      const matchesVisitorId =
        !visitorId ||
        record.visitorId.toLowerCase().includes(visitorId);

      const matchesReason =
        !reason ||
        record.reason.toLowerCase().includes(reason);

      const matchesStatus =
        !status ||
        record.status === status;

      return (
        matchesVisitorId &&
        matchesReason &&
        matchesStatus
      );
    });
  }

  get totalPages(): number {

    return Math.max(
      1,
      Math.ceil(this.filteredRecords.length / this.pageSize)
    );
  }

  get paginatedRecords(): BlacklistResponse[] {

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    return this.filteredRecords.slice(startIndex, endIndex);
  }

  getActiveCount(): number {
  return this.blacklistRecords.filter(
    record => record.status === 'ACTIVE'
  ).length;
}

getRemovedCount(): number {
  return this.blacklistRecords.filter(
    record => record.status === 'REMOVED'
  ).length;
}

  clearFilters(): void {

    this.visitorNameFilter = '';
    this.visitorIdFilter = '';
    this.reasonFilter = '';
    this.statusFilter = '';

    this.currentPage = 1;
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
}