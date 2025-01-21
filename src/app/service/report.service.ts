import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Countbydesignation } from '../entity/countByDesignation';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  constructor(private http: HttpClient) {}

  async countByDesignation(): Promise<Array<Countbydesignation>> {
    const countbydesignations = await this.http
      .get<Array<Countbydesignation>>(
        'http://localhost:8080/reports/countbydesignation'
      )
      .toPromise();
    if (countbydesignations == undefined) {
      return [];
    }
    return countbydesignations;
  }
}
