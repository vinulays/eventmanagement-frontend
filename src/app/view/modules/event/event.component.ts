import { DatePipe } from '@angular/common';
import { Component, Inject, Input, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Customer } from 'src/app/entity/customer';
import { Employee } from 'src/app/entity/employee';
import { Event } from 'src/app/entity/event';
import { EventStatus } from 'src/app/entity/eventStatus';
import { EventType } from 'src/app/entity/eventType';
import { Hall } from 'src/app/entity/hall';
import { Menu } from 'src/app/entity/menu';
import { Package } from 'src/app/entity/package';
import { SubMenu } from 'src/app/entity/submenu';
import { CustomerService } from 'src/app/service/customer.service';
import { EmployeeService } from 'src/app/service/employee.service';
import { EventService } from 'src/app/service/event.service';
import { EventStatusService } from 'src/app/service/eventStatus.service';
import { EventTypeService } from 'src/app/service/eventType.service';
import { HallService } from 'src/app/service/hall.service';
import { MenuService } from 'src/app/service/menu.service';
import { PackageService } from 'src/app/service/package.service';
import { RegexService } from 'src/app/service/regex.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css'],
})
export class EventComponent {
  cols = '12';

  // Forms
  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  event!: Event;
  oldevent!: Event;

  selectedrow: any;
  regexes: any;

  // booleans to enable / disable buttons
  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  columns: string[] = [
    'Date',
    'Start time',
    'End time',
    'Package',
    'Cost',
    'Event status',
  ];

  // Client search  form controls
  cscolumns: string[] = [
    'csDate',
    'csStartTime',
    'csEndTime',
    'csPackage',
    'csCost',
    'csEventStatus',
  ];

  // Table headers
  headers: string[] = [
    'Date',
    'Start Time',
    'End Time',
    'Package',
    'Cost',
    'Event Status',
  ];

  // Event object references for table columns
  binders: string[] = [
    'doevent',
    'starttime',
    'endtime',
    'packageField.name',
    'cost',
    'eventstatus.name',
  ];

  // Client search prompts
  csprompts: string[] = [
    'Search by Date',
    'Search Start Time',
    'Search by End Time',
    'Search by Package',
    'Search by Cost',
    'Search by Status',
  ];

  menus: Array<Menu> = [];
  events: Array<Event> = [];
  packages: Array<Package> = [];
  types: Array<EventType> = [];
  halls: Array<Hall> = [];
  employees: Array<Employee> = [];
  eventStatuses: Array<EventStatus> = [];
  customers: Array<Customer> = [];

  // Event table data source and paginator
  data: MatTableDataSource<Event> = new MatTableDataSource<Event>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private es: EventService,
    private fb: FormBuilder,
    private ps: PackageService,
    private ts: EventTypeService,
    private hs: HallService,
    private dg: MatDialog,
    private emps: EmployeeService,
    private ess: EventStatusService,
    private rs: RegexService,
    private cs: CustomerService,
    private dp: DatePipe,
    private ms: MenuService
  ) {
    // Setting values for arrays through services
    this.es.get().subscribe((response) => {
      // console.log(response);
      this.events = response;
      this.data = new MatTableDataSource(this.events);
      this.data.paginator = this.paginator;
    });

    this.ps.get().subscribe((response) => {
      this.packages = response;
    });

    this.ts.get().subscribe((response) => {
      this.types = response;
    });

    this.hs.get().subscribe((response) => {
      this.halls = response;
    });

    this.emps.get().subscribe((response) => {
      this.employees = response;
    });

    this.ess.get().subscribe((response) => {
      this.eventStatuses = response;
    });

    this.rs.get('event').subscribe((response) => {
      this.regexes = response;
      this.createForm();
    });

    this.cs.get().subscribe((response) => {
      this.customers = response;
    });

    this.ms.get().subscribe((response) => {
      this.menus = response;
      // console.log(this.menus);
    });

    this.csearch = this.fb.group({
      csDate: new FormControl(),
      csStartTime: new FormControl(),
      csEndTime: new FormControl(),
      csPackage: new FormControl(),
      csCost: new FormControl(),
      csEventStatus: new FormControl(),
    });

    this.ssearch = this.fb.group({
      ssID: new FormControl(),
      ssDate: new FormControl(),
      ssStartTime: new FormControl(),
      ssEndTime: new FormControl(),
      ssPackage: new FormControl(),
      ssCost: new FormControl(),
      ssEventStatus: new FormControl(),
      ssEventType: new FormControl(),
      ssHall: new FormControl(),
    });

    this.form = this.fb.group({
      // id: new FormControl('', [Validators.required]),
      eventtype: new FormControl('', [Validators.required]),
      customer: new FormControl('', [Validators.required]),
      employee: new FormControl('', [Validators.required]),
      packageField: new FormControl('', [Validators.required]),
      count: new FormControl('', [Validators.required]),
      hall: new FormControl('', [Validators.required]),
      doevent: new FormControl('', [Validators.required]),
      starttime: new FormControl('', [Validators.required]),
      endtime: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      eventstatus: new FormControl('', [Validators.required]),
      menu: new FormControl('', [Validators.required]),
    });
  }

  /**
   * @description filter the table according to client search form fields
   */
  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.data.filterPredicate = (event: Event, filter: String) => {
      return (
        (csearchData.csDate == null ||
          event.doevent.toString().includes(csearchData.csDate)) &&
        (csearchData.csStartTime == null ||
          event.starttime.toString().includes(csearchData.csStartTime)) &&
        (csearchData.csEndTime == null ||
          event.endtime.toString().includes(csearchData.csEndTime)) &&
        (csearchData.csPackage == null ||
          event.packageField.name
            .toLowerCase()
            .includes(csearchData.csPackage.toLowerCase())) &&
        (csearchData.csCost == null ||
          event.cost
            .toString()
            .toLowerCase()
            .includes(csearchData.csCost.toLowerCase())) &&
        (csearchData.csEventStatus == null ||
          event.eventstatus.name
            .toLowerCase()
            .includes(csearchData.csEventStatus.toLowerCase()))
      );
    };

    this.data.filter = 'xx';
  }

  /**
   * @description get property value according to object reference
   * @param element element names
   * @param reference object reference
   * @returns property values
   */
  getProperty(element: {}, reference: string): string {
    const value = reference.split('.').reduce((o, a) => {
      //@ts-ignore;
      return o[a];
    }, element) as string;
    return value;
  }

  /**
   * @description search events (server search)
   */
  search(): void {
    const ssearchData = this.ssearch.getRawValue();

    let id = ssearchData.ssID;
    let packageName = ssearchData.ssPackage;
    let type = ssearchData.ssEventType;
    let hallName = ssearchData.ssHall;

    let query = '';

    if (id != null && id.trim() != '') query += '&id=' + id.trim();
    if (packageName != null && packageName.trim() != '')
      query += '&package=' + packageName.replaceAll(' ', '');
    if (type != null && type.trim() != '')
      query += '&type=' + type.replaceAll(' ', '');
    if (hallName != null && hallName.trim() != '')
      query += '&hall=' + hallName.replaceAll(' ', '');

    if (query != '') query = query.replace(/^./, '?');
    console.log(query);

    this.updateTable(query);
  }

  /**
   * @description update the table
   * @param query query to search
   */
  updateTable(query: string) {
    this.es.search(query).subscribe((response) => {
      this.events = response;
      this.data = new MatTableDataSource(this.events);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description clear client search form fields
   */
  clearSearch(): void {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Search Clear',
        message: 'Are you sure to clear the Search?',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.ssearch.reset();
        this.updateTable('');
      }
    });
  }

  /**
   * @description add events
   */
  add() {
    // Getting form errors
    let errors = this.getErrors();

    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Event Add ',
          message: 'You have following Errors <br>' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Set current form value to event object
      this.event = this.form.getRawValue();

      // Fixing event date form timezone difference
      this.event.doevent = this.correctDateFormat(this.event.doevent);

      // this.event.menuDetails = this.menuDetails;

      let latestDate = this.dp.transform(this.event.doevent, 'yyyy-MM-dd');

      let eventData: string = '';
      eventData =
        eventData + '<br>Event type is : ' + this.event.eventtype.name;
      eventData = eventData + '<br> Event hall is : ' + this.event.hall.name;
      eventData = eventData + '<br>Customer is : ' + this.event.customer.name;
      eventData = eventData + '<br>Event date is : ' + latestDate;
      eventData = eventData + '<br>Cost is : ' + this.event.cost;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Event Add',
          message:
            'Are you sure to Add the folowing Event? <br> <br>' + eventData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          this.es.add(this.event).subscribe((response) => {
            // console.log(response);
            if (response != undefined) {
              addstatus = response['errors'] == '';
              if (!addstatus) {
                addmessage = response['errors'];
              }
            } else {
              addstatus = false;
              addmessage = 'Content Not Found';
            }

            if (addstatus) {
              addmessage = 'Successfully saved';
              // Updating the table after addition
              this.es.get().subscribe((response) => {
                this.events = response;
                this.data = new MatTableDataSource(this.events);
                this.data.paginator = this.paginator;
              });

              this.form.reset();
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status -Event Add', message: addmessage },
            });

            stsmsg.afterClosed().subscribe(async (result) => {
              if (!result) {
                return;
              }
            });
          });
        }
      });
    }
  }

  /**
   * @description get errors in form controls
   * @returns errors
   */
  getErrors() {
    let errors: string = '';

    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];

      if (control.errors) {
        if (this.regexes[controlName] != undefined) {
          errors += '<br>' + this.regexes[controlName]['message'];
        } else {
          errors += '<br>Invalid ' + controlName;
        }
      }
    }
    return errors;
  }

  /**
   * @description create event form and set appropriate validators
   */
  createForm() {
    this.form.controls['eventtype'].setValidators([Validators.required]);
    this.form.controls['employee'].setValidators([Validators.required]);
    this.form.controls['customer'].setValidators([Validators.required]);
    this.form.controls['packageField'].setValidators([Validators.required]);
    this.form.controls['count'].setValidators([Validators.required]);
    this.form.controls['hall'].setValidators([Validators.required]);
    this.form.controls['doevent'].setValidators([Validators.required]);
    this.form.controls['starttime'].setValidators([Validators.required]);
    this.form.controls['endtime'].setValidators([Validators.required]);
    this.form.controls['cost'].setValidators([Validators.required]);
    this.form.controls['description'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['description']['regex']),
    ]);
    this.form.controls['eventstatus'].setValidators([Validators.required]);
    this.form.controls['menu'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    this.enableButtons(true, false, false);
  }

  /**
   * @description fill event form when user selected a row
   * @param event user selected event object row
   */
  fillForm(event: Event) {
    this.enableButtons(false, true, true);
    this.selectedrow = event;

    this.event = JSON.parse(JSON.stringify(event));
    this.oldevent = JSON.parse(JSON.stringify(event));

    this.event.eventtype = this.types.find(
      (t) => t.id === this.event.eventtype.id
    )!;

    this.event.employee = this.employees.find(
      (e) => e.nic === this.event.employee.nic
    )!;

    this.event.customer = this.customers.find(
      (c) => c.id === this.event.customer.id
    )!;

    this.event.packageField = this.packages.find(
      (p) => p.id === this.event.packageField.id
    )!;
    this.event.hall = this.halls.find((h) => h.id === this.event.hall.id)!;
    this.event.eventstatus = this.eventStatuses.find(
      (s) => s.id === this.event.eventstatus.id
    )!;

    this.event.menu = this.menus.find((m) => m.id === this.event.menu.id)!;

    this.form.patchValue(this.event);
    this.form.markAsPristine();
  }

  /**
   * @description update event
   */
  update() {
    let errors = this.getErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Employee Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Get user updates in event form
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Event Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.event = this.form.getRawValue();
            this.event.id = this.oldevent.id;

            // If event date changed, fix new event date for timezone issue
            if (this.form.controls['doevent'].dirty) {
              this.event.doevent = this.correctDateFormat(this.event.doevent);
            }

            // Calling update in API
            this.es.update(this.event).subscribe((response) => {
              if (response != undefined) {
                updstatus = response['errors'] == '';

                if (!updstatus) {
                  updmessage = response['errors'];
                }
              } else {
                updstatus = false;
                updmessage = 'Content not found';
              }

              if (updstatus) {
                updmessage = 'Successfully Updated';
                this.form.reset();
                Object.values(this.form.controls).forEach((control) => {
                  control.markAsTouched();
                });
                this.updateTable('');
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status -Event Update',
                  message: updmessage,
                },
              });
              stsmsg.afterClosed().subscribe(async (result) => {
                if (!result) {
                  return;
                }
              });
            });
          }
        });
      } else {
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Employee Update',
            message: 'Nothing Changed',
          },
        });
        updmsg.afterClosed().subscribe(async (result) => {
          if (!result) {
            return;
          }
        });
      }
    }
  }

  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description get updates in event form
   * @returns updates string
   */
  getUpdates(): string {
    let updates = '';
    for (const controlName in this.form.controls) {
      const control = this.form.controls[controlName];
      if (control.dirty) {
        updates +=
          '<br>' +
          controlName.charAt(0).toUpperCase() +
          controlName.slice(1) +
          ' Changed';
      }
    }
    return updates;
  }

  /**
   * @description clear event form
   */
  clear() {
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Clear Form',
        message:
          'Are you sure to clear the Form? <br> <br> You will lost your updates',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.oldevent = undefined!;
        this.form.reset();
        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });
      }
    });
  }

  /**
   * @description delete user
   */
  delete() {
    this.event = this.form.getRawValue();
    // console.log(this.event);

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Employee Delete',
        message: 'Are you sure to delete the employee? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.event = this.form.getRawValue();
        let id: number = this.oldevent.id;

        // console.log('ID' + id);

        this.es.delete(id).subscribe((response) => {
          if (response != undefined) {
            delstatus = response['errors'] == '';

            if (!delstatus) {
              delmessage = response['errors'];
            }
          } else {
            delstatus = false;
            delmessage = 'Content not found';
          }

          if (delstatus) {
            delmessage = 'Successfully deleted';
            this.form.reset();
            Object.values(this.form.controls).forEach((control) => {
              control.markAsTouched();
            });
            this.updateTable('');
          }

          const stsmg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Event Delete',
              message: delmessage,
            },
          });
          stsmg.afterClosed().subscribe(async (result) => {
            if (!result) {
              return;
            }
          });
        });
      }
    });
  }

  /**
   * @description correct date format to fix saving the date one day off
   * @param date date to change format
   * @returns formatted date
   */
  correctDateFormat(date: Date) {
    var offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset);
  }
}
