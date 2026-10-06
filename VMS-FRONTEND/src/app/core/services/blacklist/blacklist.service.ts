import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddVisitorToBlacklistRequest } from '../../models/blacklist/blacklist.model';
import { BlacklistResponse } from '../../models/blacklist/blacklist.model';

@Injectable({
  providedIn: 'root',
})
export class BlacklistService {
  private readonly apiUrl = 'http://localhost:8092/api/blacklist';

  constructor(
    private http: HttpClient,
  ) {}

  getAllBlacklistRecords(): Observable<BlacklistResponse[]> {
    return this.http.get<BlacklistResponse[]>(this.apiUrl);
  }

  getBlacklistById(id: string): Observable<BlacklistResponse> {
    return this.http.get<BlacklistResponse>(`${this.apiUrl}/${id}`);
  }

  addExistingVisitorToBlacklist(
    visitorId: string,
    request: AddVisitorToBlacklistRequest,
  ): Observable<BlacklistResponse> {
    return this.http.post<BlacklistResponse>(
      `${this.apiUrl}/visitor/${visitorId}`,
      request,
    );
  }

  removeFromBlacklist(
    blacklistId: string,
    removedBy: string,
  ): Observable<BlacklistResponse> {
    return this.http.put<BlacklistResponse>(
      `${this.apiUrl}/${blacklistId}/remove`,
      null,
      {
        params: {
          removedBy,
        },
      },
    );
  }

  isBlacklisted(visitorId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/visitor/${visitorId}/status`,
    );
  }
}