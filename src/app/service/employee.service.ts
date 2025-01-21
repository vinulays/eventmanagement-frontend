import { HttpClient } from '@angular/common/http';
import { Event } from '../entity/event';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Employee } from '../entity/employee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/employees/list';

  get(): Observable<any> {
    return this.http.get(this.baseURL);
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + query);
  }

  add(employee: Employee): Observable<any> {
    return this.http.post<[]>('http://localhost:8080/employees', employee);
  }

  update(employee: Employee): Observable<any> {
    return this.http.put<[]>('http://localhost:8080/employees', employee);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>('http://localhost:8080/employees/' + id);
  }
}
