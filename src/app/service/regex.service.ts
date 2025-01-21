import { HttpClient } from '@angular/common/http';
import { Event } from '../entity/event';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegexService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/regexes/';

  get(type: string): Observable<any> {
    return this.http.get(this.baseURL + type);
  }
}
