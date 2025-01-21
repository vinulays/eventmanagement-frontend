import { ExpenseType } from './expenseType';
import { Item } from './item';
import { Supplier } from './supplier';

export class Expense {
  id!: number;
  expenseType!: ExpenseType;
  description!: string;
  supplier!: Supplier;
  item!: Item;
  date!: Date;
  cost!: number;
}
