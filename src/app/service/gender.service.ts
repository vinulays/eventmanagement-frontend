import { HttpClient } from '@angular/common/http';
import { Event } from '../entity/event';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GenderService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/genders/list';

  get(): Observable<any> {
    return this.http.get(this.baseURL);
  }
}
