import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from '../entity/expense';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/expenses';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + '/list' + query);
  }

  add(expense: Expense): Observable<any> {
    return this.http.post(this.baseURL, expense);
  }

  update(expense: Expense): Observable<any> {
    return this.http.put<[]>(this.baseURL, expense);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>(this.baseURL + '/' + id);
  }
}
