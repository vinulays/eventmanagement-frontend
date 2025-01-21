import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentStatusService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/paymentStatus/list';

  get(): Observable<any> {
    return this.http.get(this.baseURL);
  }
}
