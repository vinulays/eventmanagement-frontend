import { HttpClient } from '@angular/common/http';
import { Event } from '../entity/event';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/events/list';

  get(): Observable<any> {
    return this.http.get(this.baseURL);
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + query);
  }

  add(event: Event): Observable<any> {
    return this.http.post('http://localhost:8080/events', event);
  }

  update(event: Event): Observable<any> {
    return this.http.put<[]>('http://localhost:8080/events', event);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>('http://localhost:8080/events/' + id);
  }
}
