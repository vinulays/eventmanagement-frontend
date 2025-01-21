import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Salary } from '../entity/salary';

@Injectable({
  providedIn: 'root',
})
export class SalaryService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/salaries';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + '/list' + query);
  }

  add(salary: Salary): Observable<any> {
    return this.http.post(this.baseURL, salary);
  }

  update(salary: Salary): Observable<any> {
    return this.http.put<[]>(this.baseURL, salary);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>(this.baseURL + '/' + id);
  }
}
