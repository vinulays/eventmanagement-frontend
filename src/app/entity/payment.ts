import { Customer } from './customer';
import { Event } from './event';
import { PaymentStatus } from './paymentStatus';

export class Payment {
  id!: number;
  customer!: Customer;
  event!: Event;
  totalCost!: number;
  paidAmount!: number;
  dueAmount!: number;
  status!: PaymentStatus;
}
