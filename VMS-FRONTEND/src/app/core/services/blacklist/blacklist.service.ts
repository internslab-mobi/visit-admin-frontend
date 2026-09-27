import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BlacklistResponse } from '../../models/blacklist/blacklist.model';

@Injectable({
  providedIn: 'root'
})
export class BlacklistService {

  private readonly apiUrl = 'http://localhost:8092/api/blacklist';

  constructor(private http: HttpClient) {}

  getAllBlacklistRecords(): Observable<BlacklistResponse[]> {
    return this.http.get<BlacklistResponse[]>(this.apiUrl);
  }

  getBlacklistById(id: string): Observable<BlacklistResponse> {
  return this.http.get<BlacklistResponse>(
    `${this.apiUrl}/${id}`
  );
}
}