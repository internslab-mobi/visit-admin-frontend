import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  VendorService,
  VendorResponse
} from '../../../core/services/vendor/vendor.service';



  //  VENDOR RECORD


interface VendorRecord {

  id: string;

  visitorId: string;

  name: string;

  email: string;

  mobile: string;

  company: string;

  validity: string | null;

}



  //  COMPONENT


@Component({

  selector: 'app-vendor-list',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './vendor-list.html',

  styleUrl: './vendor-list.css'

})
export class VendorListComponent implements OnInit {


  
    //  SERVICES
  

  private readonly vendorService =
    inject(VendorService);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  private readonly router =
    inject(Router);


  
    //  STATE
  

  vendorRecords: VendorRecord[] = [];

  loading = true;

  errorMessage = '';


  
    //  FILTERS
  

  searchText = '';

  fromDate = '';

  toDate = '';


  
    //  SORTING
  

  sortBy = 'name';

  sortDirection: 'asc' | 'desc' = 'asc';


  
    //  PAGINATION
  

  currentPage = 1;

  pageSize = 10;


  
    //  INITIALIZATION
  

  ngOnInit(): void {

    this.loadVendors();

  }


  
    //  LOAD VENDORS
  

  private loadVendors(): void {

    this.loading = true;

    this.errorMessage = '';

    this.vendorService
      .getVendors()
      .subscribe({

        next: (vendors) => {

          console.log(
            'VENDOR API RESPONSE:',
            vendors
          );

          this.vendorRecords =
            vendors.map(vendor =>
              this.mapToVendorRecord(vendor)
            );

          console.log(
            'VENDOR RECORDS:',
            this.vendorRecords
          );

          this.loading = false;

          this.changeDetectorRef.markForCheck();

        },


        error: (error) => {

          console.error(
            'Failed to load vendors:',
            error
          );

          this.vendorRecords = [];

          this.loading = false;

          this.errorMessage =
            'Failed to load vendors.';

          this.changeDetectorRef.markForCheck();

        }

      });

  }


  
    //  MAP API RESPONSE
  

  private mapToVendorRecord(
    vendor: VendorResponse
  ): VendorRecord {

    return {

      id: vendor.id,

      visitorId: vendor.visitorId,

      name:
        `${vendor.firstName} ${vendor.lastName}`,

      email: vendor.email,

      mobile: vendor.mobileNumber,

      company:
        vendor.companyName ?? '-',

      validity:
        vendor.validity

    };

  }


  
    //  FILTER + SORT
  

  get filteredVendors(): VendorRecord[] {

    const search =
      this.searchText
        .toLowerCase()
        .trim();


    let vendors =
      this.vendorRecords.filter(vendor => {


        
          //  SEARCH
        

        const matchesSearch =

          !search ||

          vendor.name
            .toLowerCase()
            .includes(search)

          ||

          vendor.email
            .toLowerCase()
            .includes(search)

          ||

          vendor.mobile
            .includes(search)

          ||

          vendor.id
            .toLowerCase()
            .includes(search)

          ||

          vendor.visitorId
            .toLowerCase()
            .includes(search)

          ||

          vendor.company
            .toLowerCase()
            .includes(search);


        
          //  FROM DATE
        

        const matchesFromDate =

          !this.fromDate ||

          (
            vendor.validity &&

            vendor.validity
              .substring(0, 10) >=
              this.fromDate
          );


        
          //  TO DATE
        

        const matchesToDate =

          !this.toDate ||

          (
            vendor.validity &&

            vendor.validity
              .substring(0, 10) <=
              this.toDate
          );


        return (

          matchesSearch &&

          matchesFromDate &&

          matchesToDate

        );

      });


    
      //  SORTING
    

    vendors.sort((a, b) => {

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


        case 'validity':

          comparison =
            (
              a.validity || ''
            ).localeCompare(
              b.validity || ''
            );

          break;


        case 'id':

          comparison =
            a.id.localeCompare(
              b.id
            );

          break;


        case 'visitorId':

          comparison =
            a.visitorId.localeCompare(
              b.visitorId
            );

          break;

      }


      return this.sortDirection === 'asc'

        ? comparison

        : -comparison;

    });


    return vendors;

  }


  
    //  PAGINATION
  

  get paginatedVendors(): VendorRecord[] {

    const startIndex =
      (this.currentPage - 1) *
      this.pageSize;


    return this.filteredVendors.slice(

      startIndex,

      startIndex + this.pageSize

    );

  }


  get totalPages(): number {

    return Math.ceil(

      this.filteredVendors.length /
      this.pageSize

    );

  }


  get startRecord(): number {

    if (
      this.filteredVendors.length === 0
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

      this.filteredVendors.length

    );

  }


  
    //  FILTER CHANGE
  

  onFilterChange(): void {

    this.currentPage = 1;

  }


  
    //  SORT CHANGE
  

  onSortChange(): void {

    this.currentPage = 1;

  }


  
    //  PREVIOUS PAGE
  

  previousPage(): void {

    if (this.currentPage > 1) {

      this.currentPage--;

    }

  }


  
    //  NEXT PAGE
  

  nextPage(): void {

    if (
      this.currentPage <
      this.totalPages
    ) {

      this.currentPage++;

    }

  }


  
    //  CLEAR FILTERS
  

  clearFilters(): void {

    this.searchText = '';

    this.fromDate = '';

    this.toDate = '';

    this.sortBy = 'name';

    this.sortDirection = 'asc';

    this.currentPage = 1;

  }


  
    //  TOTAL
  

  get totalVendors(): number {

    return this.vendorRecords.length;

  }


  
    //  VALIDITY STATUS
  

  getValidityStatus(
    validity: string | null
  ): string {

    if (!validity) {

      return 'No Validity';

    }


    const validityDate =
      new Date(validity);

    const now =
      new Date();


    return validityDate >= now
      ? 'Active'
      : 'Expired';

  }


  
    //  VALIDITY STATUS CLASS
  

  getValidityStatusClass(
    validity: string | null
  ): string {

    return this
      .getValidityStatus(validity)
      .toLowerCase()
      .replaceAll(' ', '-');

  }


  
    //  DATE FORMAT
  

  formatValidity(
    validity: string | null
  ): string {

    if (!validity) {

      return '-';

    }


    return new Date(validity)
      .toLocaleString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );

  }


  
    //  VIEW VENDOR
  

  viewVendor(
    vendorId: string
  ): void {

    this.router.navigate([
      '/admin/vendors',
      vendorId
    ]);

  }

}