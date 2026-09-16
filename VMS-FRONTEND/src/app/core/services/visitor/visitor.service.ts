// import { Injectable, inject } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable,of,throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { Visitor } from '../../models/visitor/visitor.model';
// import { API_CONFIG } from '../../../../environments/environment.dev';
// @Injectable({
//   providedIn: 'root'
// })
// export class VisitorService {

//   private readonly http = inject(HttpClient);

//   private readonly apiUrl = `${API_CONFIG.BASE_URL}/api/visitors`;

//   /**
//    * Search visitor by email
//    */
// searchVisitorByEmail(email: string): Observable<Visitor | null> {

//   const normalizedEmail = email.trim().toLowerCase();

//   return this.http
//     .get<Visitor>(
//       `${this.apiUrl}/email/${encodeURIComponent(normalizedEmail)}`
//     )
//     .pipe(
//       catchError(error => {

//         if (error.status === 404) {
//           return of(null);
//         }

//         return throwError(() => error);
//       })
//     );
// }

//   /**
//    * Create a new visitor
//    */
//   createVisitor(
//     visitorData: Omit<Visitor, 'id' | 'cooldownUntil'>
//   ): Observable<Visitor> {

//     return this.http.post<Visitor>(
//       this.apiUrl,
//       visitorData
//     );
//   }

//   /**
//    * Get all visitors
//    */
//   getAllVisitors(): Observable<Visitor[]> {

//     return this.http.get<Visitor[]>(
//       this.apiUrl
//     );
//   }

//   /**
//    * Get visitor by ID
//    */
//   getVisitorById(id: number): Observable<Visitor | null> {

//     return new Observable<Visitor | null>(subscriber => {

//       this.http
//         .get<Visitor>(`${this.apiUrl}/${id}`)
//         .subscribe({
//           next: visitor => {
//             subscriber.next(visitor);
//             subscriber.complete();
//           },
//           error: error => {

//             if (error.status === 404) {
//               subscriber.next(null);
//               subscriber.complete();
//               return;
//             }

//             subscriber.error(error);
//           }
//         });

//     });
//   }
// }

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Visitor } from '../../models/visitor/visitor.model';
import { API_CONFIG } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${API_CONFIG.BASE_URL}/api/visitors`;

  /**
   * Create a new visitor
   */
  createVisitor(
    visitorData: Omit<Visitor, 'id' | 'cooldownUntil'>
  ): Observable<Visitor> {

    return this.http.post<Visitor>(
      this.apiUrl,
      visitorData
    );
  }
}