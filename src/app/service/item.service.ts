import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../entity/item';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/items';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + '/list' + query);
  }

  add(item: Item): Observable<any> {
    return this.http.post(this.baseURL, item);
  }

  update(item: Item): Observable<any> {
    return this.http.put<[]>(this.baseURL, item);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>(this.baseURL + '/' + id);
  }
}
