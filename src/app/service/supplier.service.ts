import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier } from '../entity/supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/suppliers';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + '/list' + query);
  }

  add(supplier: Supplier): Observable<any> {
    return this.http.post(this.baseURL, supplier);
  }

  update(supplier: Supplier): Observable<any> {
    return this.http.put<[]>(this.baseURL, supplier);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>(this.baseURL + '/' + id);
  }
}
