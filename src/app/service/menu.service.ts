import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Menu } from '../entity/menu';
import { SubMenu } from '../entity/submenu';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient) {}

  baseURL: string = 'http://localhost:8080/menus';

  get(): Observable<any> {
    return this.http.get(this.baseURL + '/list');
  }

  getByID(id: number): Observable<any> {
    return this.http.get(this.baseURL + '/' + id);
  }

  search(query: string): Observable<any> {
    return this.http.get(this.baseURL + '/list' + query);
  }

  add(menu: Menu): Observable<any> {
    return this.http.post(this.baseURL, menu);
  }

  addSubMenu(menuID: number, submenu: SubMenu): Observable<any> {
    return this.http.post(this.baseURL + '/' + menuID, submenu);
  }

  update(menu: Menu): Observable<any> {
    return this.http.put<[]>(this.baseURL, menu);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<[]>(this.baseURL + '/' + id);
  }
}
