import { HttpClient } from '@angular/common/http';
import { Event } from '../entity/event';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Hall } from '../entity/hall';

@Injectable({
  providedIn: 'root',
})
export class HallService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/halls';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }

  getHistory(hall: Hall): Observable<any> {
    return this.http.get(this.baseURL + '/' + hall.id);
  }

  add(hall: Hall): Observable<any> {
    return this.http.post(this.baseURL, hall);
  }

  update(hall: Hall): Observable<any> {
    return this.http.put(this.baseURL, hall);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(this.baseURL + '/' + id);
  }
}
