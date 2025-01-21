import { Employee } from './employee';

export class Salary {
  id!: number;
  employee!: Employee;
  salaryStartDate!: Date;
  salaryEndDate!: Date;
  amount!: number;
}
