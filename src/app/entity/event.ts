import { EventType } from './eventType';
import { Customer } from './customer';
import { Employee } from './employee';
import { Package } from './package';
import { Hall } from './hall';
import { EventStatus } from './eventStatus';
import { Menu } from './menu';

export class Event {
  public id!: number;
  public eventtype!: EventType;
  public customer!: Customer;
  public employee!: Employee;
  public packageField!: Package;
  public count!: number;
  public hall!: Hall;
  public doevent!: Date;
  public starttime!: Date;
  public endtime!: Date;
  public cost!: number;
  public description!: string;
  public eventstatus!: EventStatus;
  public menu!: Menu;

  constructor(
    id: number,
    eventtype: EventType,
    customer: Customer,
    employee: Employee,
    packageField: Package,
    count: number,
    hall: Hall,
    doevent: Date,
    starttime: Date,
    endtime: Date,
    cost: number,
    description: string,
    eventstatus: EventStatus,
    menu: Menu
  ) {
    this.id = id;
    this.eventtype = eventtype;
    this.customer = customer;
    this.employee = employee;
    this.packageField = packageField;
    this.count = count;
    this.hall = hall;
    this.doevent = doevent;
    this.starttime = starttime;
    this.endtime = endtime;
    this.cost = cost;
    this.description = description;
    this.eventstatus = eventstatus;
    this.menu = menu;
  }
}
