import { Employee } from './employee';
import { UserStatus } from './userStatus';

export class User {
  public id!: number;
  public username!: string;
  public password!: string;
  public salt!: string;
  public docreated!: Date;
  public userStatus!: UserStatus;
  public employee!: Employee;
  public description!: string;
}
