import { HttpClient } from '@angular/common/http';
import { Event } from '../entity/event';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Customer } from '../entity/customer';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/customers';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + '/list' + query);
  }

  add(customer: Customer): Observable<any> {
    return this.http.post(this.baseURL, customer);
  }

  update(customer: Customer): Observable<any> {
    return this.http.put<[]>(this.baseURL, customer);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>(this.baseURL + '/' + id);
  }
}
