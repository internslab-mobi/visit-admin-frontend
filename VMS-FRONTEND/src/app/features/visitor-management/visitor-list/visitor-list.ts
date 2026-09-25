import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  VisitorService,
  VisitorResponse
} from '../../../core/services/visitor/visitor.service';
import { VisitorType } from '../../../core/models/registration/registration.model';

interface VisitorRecord {

  id: string;

  name: string;

  email: string;

  mobile: string;

  company: string;

  visitorType: string;

  lastVisitDate: string;

}


@Component({
  selector: 'app-visitor-list',

  imports: [
    FormsModule,
     RouterLink
  ],

  templateUrl: './visitor-list.html',

  styleUrl: './visitor-list.css'
})
export class VisitorListComponent implements OnInit {

  private readonly visitorService =
    inject(VisitorService);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);


  visitorRecords: VisitorRecord[] = [];


  /* ================================
     FILTERS
  ================================= */

  searchText = '';

  selectedVisitorType = '';

  fromDate = '';

  toDate = '';


  /* ================================
     SORTING
  ================================= */

  sortBy = 'lastVisitDate';

  sortDirection: 'asc' | 'desc' = 'desc';


  /* ================================
     PAGINATION
  ================================= */

  currentPage = 1;

  pageSize = 10;


  /* ================================
     INITIALIZATION
  ================================= */

  ngOnInit(): void {

    this.loadVisitors();

  }


  /* ================================
     LOAD VISITORS
  ================================= */

  private loadVisitors(): void {

    this.visitorService
      .getVisitors()
      .subscribe({

        next: (visitors) => {

          console.log(
            'VISITOR API RESPONSE:',
            visitors
          );


          this.visitorRecords =
            visitors.map(visitor =>
              this.mapToVisitorRecord(visitor)
            );


          console.log(
            'VISITOR RECORDS:',
            this.visitorRecords
          );


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


  /* ================================
     MAP API RESPONSE
  ================================= */

  private mapToVisitorRecord(
    visitor: VisitorResponse
  ): VisitorRecord {

    return {

      id: visitor.id,

      name:
        `${visitor.firstName} ${visitor.lastName}`,

      email: visitor.email,

      mobile: visitor.mobileNumber,

      company:
        visitor.companyName ?? '-',

      visitorType:
        visitor.visitorType ?? '-',

      lastVisitDate:
        visitor.lastVisitDate ?? ''

    };

  }


  /* ================================
     FILTER + SORT
  ================================= */

  get filteredVisitors(): VisitorRecord[] {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    let visitors =
      this.visitorRecords.filter(visitor => {


        /* Search */

        const matchesSearch =

          !search ||

          visitor.name
            .toLowerCase()
            .includes(search)

          ||

          visitor.email
            .toLowerCase()
            .includes(search)

          ||

          visitor.mobile
            .includes(search)

          ||

          visitor.id
            .toLowerCase()
            .includes(search)

          ||

          visitor.company
            .toLowerCase()
            .includes(search);


        /* Visitor Type */

        const matchesVisitorType =

          !this.selectedVisitorType ||

          visitor.visitorType ===
            this.selectedVisitorType;


        /* From Date */

        const matchesFromDate =

          !this.fromDate ||

          (
            visitor.lastVisitDate &&
            visitor.lastVisitDate
              .substring(0, 10) >=
              this.fromDate
          );


        /* To Date */

        const matchesToDate =

          !this.toDate ||

          (
            visitor.lastVisitDate &&
            visitor.lastVisitDate
              .substring(0, 10) <=
              this.toDate
          );


        return (

          matchesSearch &&

          matchesVisitorType &&

          matchesFromDate &&

          matchesToDate

        );

      });


    /* ================================
       SORTING
    ================================= */

    visitors.sort((a, b) => {

      let comparison = 0;


      switch (this.sortBy) {

        case 'name':

          comparison =
            a.name.localeCompare(
              b.name
            );

          break;


        case 'company':

          comparison =
            a.company.localeCompare(
              b.company
            );

          break;


        case 'visitorType':

          comparison =
            a.visitorType.localeCompare(
              b.visitorType
            );

          break;


        case 'lastVisitDate':

          comparison =
            (
              a.lastVisitDate || ''
            ).localeCompare(
              b.lastVisitDate || ''
            );

          break;


        case 'id':

          comparison =
            a.id.localeCompare(
              b.id
            );

          break;

      }


      return this.sortDirection === 'asc'
        ? comparison
        : -comparison;

    });


    return visitors;

  }


  /* ================================
     PAGINATION
  ================================= */

  get paginatedVisitors(): VisitorRecord[] {

    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;


    return this.filteredVisitors.slice(

      startIndex,

      startIndex + this.pageSize

    );

  }


  get totalPages(): number {

    return Math.ceil(

      this.filteredVisitors.length /
      this.pageSize

    );

  }


  get startRecord(): number {

    if (
      this.filteredVisitors.length === 0
    ) {

      return 0;

    }


    return (

      (this.currentPage - 1) *
      this.pageSize

    ) + 1;

  }


  get endRecord(): number {

    return Math.min(

      this.currentPage *
      this.pageSize,

      this.filteredVisitors.length

    );

  }


  /* ================================
     SORT
  ================================= */

  onSortChange(): void {

    this.currentPage = 1;

  }


  /* ================================
     FILTER CHANGE
  ================================= */

  onFilterChange(): void {

    this.currentPage = 1;

  }


  /* ================================
     PAGINATION
  ================================= */

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }


  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }


  /* ================================
     CLEAR FILTERS
  ================================= */

  clearFilters(): void {

    this.searchText = '';

    this.selectedVisitorType = '';

    this.fromDate = '';

    this.toDate = '';

    this.sortBy = 'lastVisitDate';

    this.sortDirection = 'desc';

    this.currentPage = 1;

  }


  /* ================================
     TOTAL
  ================================= */

  get totalVisitors(): number {

    return this.visitorRecords.length;

  }


  /* ================================
     DISPLAY HELPERS
  ================================= */

  getVisitorTypeLabel(
    type: string
  ): string {

    switch (type) {

      case 'VISITOR':
        return 'Visitor';

      case 'GUEST':
        return 'Guest';

      case 'VENDOR':
        return 'Vendor';

      default:
        return type;

    }

  }


  formatVisitDate(
    date: string
  ): string {

    if (!date) {

      return '-';

    }


    const visitDate =
      new Date(date);


    return visitDate.toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );

  }


  formatVisitTime(
    date: string
  ): string {

    if (!date) {

      return '';

    }


    const visitDate =
      new Date(date);


    return visitDate.toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    );

  }

}