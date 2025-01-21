import { Supplier } from './supplier';

export class Item {
  id!: number;
  name!: string;
  description!: string;
  price!: number;
  quantity!: number;
  supplier!: Supplier;
}
