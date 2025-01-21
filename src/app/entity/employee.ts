import { Gender } from './gender';
import { Designation } from './designation';
import { EmployeeStatus } from './employeeStatus';

export class Employee {
  public id!: number;
  public number!: string;
  public fullname!: string;
  public callingname!: string;
  public photo!: string;
  public gender!: Gender;
  public dobirth!: Date;
  public nic!: string;
  public address!: string;
  public mobile!: string;
  public land!: string;
  public doassignment!: Date;
  public designation!: Designation;
  public employeestatus!: EmployeeStatus;
  public description!: string;
}
