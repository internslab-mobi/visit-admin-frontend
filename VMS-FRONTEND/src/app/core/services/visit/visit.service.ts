// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';

// import { Visit } from '../../models/visitor/visit.model';
// import { VisitStatus } from '../../models/visitor/visit-status';

// @Injectable({
//   providedIn: 'root'
// })
// export class VisitService {

//   /*
//    * Temporary mock visit data.
//    *
//    * Later this will be replaced with
//    * HttpClient calls to the Spring Boot backend.
//    */
//   private visits: Visit[] = [
//     {
//       id: 1,
//       visitReference: 'VIS-20260917-0001',

//       visitorId: 1,

//       visitorType: 'Visitor',
//       registrationType: 'Pre-Registration',

//       purpose: 'Project discussion',

//       hostId: 2,
//       departmentId: 2,

//       expectedArrivalAt: '2026-09-17T10:30:00',
//       expectedDepartureAt: null,

//       remarks: 'Project discussion',

//       /*
//        * ID proof is optional.
//        */
//       proofType: null,
//       proofNumber: null,
//       proofImagePath: null,

//       status: 'SCHEDULED'
//     },

//     {
//       id: 2,
//       visitReference: 'VIS-20260916-0002',

//       visitorId: 2,

//       visitorType: 'Visitor',
//       registrationType: 'Arrival Registration',

//       purpose: 'Interview',

//       hostId: 4,
//       departmentId: 1,

//       expectedArrivalAt: '2026-09-16T14:00:00',
//       expectedDepartureAt: null,

//       remarks: 'Interview',

//       proofType: null,
//       proofNumber: null,
//       proofImagePath: null,

//       status: 'CHECKED_IN'
//     }
//   ];

//   /**
//    * Create a new visit.
//    */
//   createVisit(
//     visitData: Omit<
//       Visit,
//       'id' | 'visitReference'
//     >
//   ): Observable<Visit> {

//     /*
//      * Prevent an accidental duplicate visit.
//      *
//      * A visitor can visit multiple times,
//      * but the same visitor should not have
//      * the exact same arrival time twice.
//      */
//     const duplicateVisit =
//       this.visits.find(visit =>
//         visit.visitorId === visitData.visitorId &&
//         visit.expectedArrivalAt ===
//           visitData.expectedArrivalAt &&
//         visit.status !== 'CANCELLED'
//       );

//     if (duplicateVisit) {
//       throw new Error(
//         'A visit for this visitor already exists for the selected date and time.'
//       );
//     }

//     /*
//      * Generate a temporary ID.
//      *
//      * The real backend will generate this.
//      */
//     const newId =
//       this.visits.length > 0
//         ? Math.max(
//             ...this.visits.map(
//               visit => visit.id
//             )
//           ) + 1
//         : 1;

//     /*
//      * Generate a temporary visit reference.
//      *
//      * The backend will eventually generate
//      * the actual visit reference.
//      */
//     const visitReference =
//       `VIS-${this.formatDateForReference()}-${newId
//         .toString()
//         .padStart(4, '0')}`;

//     const newVisit: Visit = {
//       ...visitData,

//       id: newId,

//       visitReference
//     };

//     this.visits.push(newVisit);

//     return of(newVisit);
//   }

//   /**
//    * Get all visits.
//    */
//   getAllVisits(): Observable<Visit[]> {

//     return of([
//       ...this.visits
//     ]);
//   }

//   /**
//    * Get visits belonging to a visitor.
//    */
//   getVisitsByVisitorId(
//     visitorId: number
//   ): Observable<Visit[]> {

//     return of(
//       this.visits.filter(
//         visit =>
//           visit.visitorId === visitorId
//       )
//     );
//   }

//   /**
//    * Get a visit by ID.
//    */
//   getVisitById(
//     id: number
//   ): Observable<Visit | null> {

//     const visit =
//       this.visits.find(
//         visit => visit.id === id
//       );

//     return of(
//       visit ?? null
//     );
//   }

//   /**
//    * Update visit status.
//    */
//   updateVisitStatus(
//     visitId: number,
//     status: VisitStatus
//   ): Observable<Visit | null> {

//     const visit =
//       this.visits.find(
//         visit => visit.id === visitId
//       );

//     if (!visit) {
//       return of(null);
//     }

//     visit.status = status;

//     /*
//      * Your current backend Visit entity does not
//      * contain actual check-in/check-out fields.
//      *
//      * Therefore we don't maintain them here.
//      */

//     return of({
//       ...visit
//     });
//   }

//   /**
//    * Generate a date for the temporary
//    * visit reference.
//    */
//   private formatDateForReference(): string {

//     const date = new Date();

//     const year =
//       date.getFullYear();

//     const month =
//       (date.getMonth() + 1)
//         .toString()
//         .padStart(2, '0');

//     const day =
//       date.getDate()
//         .toString()
//         .padStart(2, '0');

//     return `${year}${month}${day}`;
//   }
// }

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../../../environments/environment.dev';
@Injectable({
  providedIn: 'root'
})
export class VisitService {

  private readonly http = inject(HttpClient);

   private readonly apiUrl = `${API_CONFIG.BASE_URL}/api/visits`;

  createVisit(request: RegistrationRequest): Observable<RegistrationResponse> {
  return this.http.post<RegistrationResponse>(
    this.apiUrl,
    request
  );
}
}

/**
 * Request sent to the backend
 */
export interface RegistrationRequest {
  registrationType: string;
  visitorType: string;

  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string;

  purpose: string;
  hostId: number;

  visitDate: string;
  expectedArrivalTime: string;
  expectedDepartureTime: string;

  remarks?: string | null;

  proofType?: string | null;
  proofNumber?: string | null;
}

/**
 * Response returned by the backend
 */
export interface RegistrationResponse {
  visitId: number;
  visitReference: string;

  visitorId: number;

  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string;

  visitorType: string;
  registrationType: string;

  purpose: string;

  hostId: number;
  departmentId: number | null;

  expectedArrivalAt: string;
  expectedDepartureAt: string;

  remarks: string | null;

  status: string;

  message: string;
}