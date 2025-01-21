import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseTypeService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/expenseTypes';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }
}
