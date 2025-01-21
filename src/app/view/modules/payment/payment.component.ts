import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Customer } from 'src/app/entity/customer';
import { Event } from 'src/app/entity/event';
import { EventType } from 'src/app/entity/eventType';
import { Package } from 'src/app/entity/package';
import { Payment } from 'src/app/entity/payment';
import { PaymentStatus } from 'src/app/entity/paymentStatus';
import { CustomerService } from 'src/app/service/customer.service';
import { EventService } from 'src/app/service/event.service';
import { EventTypeService } from 'src/app/service/eventType.service';
import { PackageService } from 'src/app/service/package.service';
import { PaymentStatusService } from 'src/app/service/payment-status.service';
import { PaymentService } from 'src/app/service/payment.service';
import { RegexService } from 'src/app/service/regex.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent {
  cols = '12';

  columns: string[] = [
    'Customer Name',
    'Event Date',
    'Event Type',
    'Event Package',
    'Count',
    'Total Amount',
    'Paid Amount',
    'Due Amount',
    'Payment Status',
  ];

  cscolumns: string[] = [
    'cscustomername',
    'csdoevent',
    'cseventtype',
    'cspackage',
    'cscount',
    'cstotalamount',
    'cspaidamount',
    'csdueamount',
    'csstatus',
  ];

  headers: string[] = [
    'Customer Name',
    'Event Date',
    'Event Type',
    'Event Package',
    'Count',
    'Total Amount',
    'Paid Amount',
    'Due Amount',
    'Payment Status',
  ];
  binders: string[] = [
    'customer.name',
    'event.doevent',
    'event.eventtype.name',
    'event.packageField.name',
    'event.count',
    'totalCost',
    'paidAmount',
    'dueAmount',
    'status.name',
  ];

  csprompts: string[] = [
    'Search by Customer name',
    'Search by Event date',
    'Search by Event type',
    'Search by Package name',
    'Search by Event cost',
    'Search by Total cost',
    'Search by Paid amount',
    'Search by Due amount',
    'Search by Status',
  ];

  payments: Array<Payment> = [];
  packages: Array<Package> = [];
  events: Array<Event> = [];
  oldEvents: Array<Event> = [];
  customerEvents: Array<Event> = [];
  customers: Array<Customer> = [];
  statuses: Array<PaymentStatus> = [];
  eventTypes: Array<EventType> = [];
  regexes: any;

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  payment!: Payment;
  oldpayment!: Payment;

  selectedrow: any;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  // Data source and paginator for payment table
  data: MatTableDataSource<Payment> = new MatTableDataSource<Payment>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ps: PaymentService,
    private fb: FormBuilder,
    private pss: PaymentStatusService,
    private pkgs: PackageService,
    private rs: RegexService,
    private es: EventService,
    private cs: CustomerService,
    private dg: MatDialog,
    private ets: EventTypeService,
    private dp: DatePipe
  ) {
    // Getting payments from server
    this.ps.get().subscribe((response) => {
      this.payments = response;

      this.data = new MatTableDataSource(this.payments);
      this.data.paginator = this.paginator;
    });

    this.csearch = this.fb.group({
      cscustomername: new FormControl(),
      csdoevent: new FormControl(),
      cseventtype: new FormControl(),
      cspackage: new FormControl(),
      cscount: new FormControl(),
      cstotalamount: new FormControl(),
      cspaidamount: new FormControl(),
      csdueamount: new FormControl(),
      csstatus: new FormControl(),
    });

    this.ssearch = this.fb.group({
      sscustomername: new FormControl(),
      ssdoevent: new FormControl(),
      sseventtype: new FormControl(),
      sspackage: new FormControl(),
      sscount: new FormControl(),
      sstotalamount: new FormControl(),
      sspaidamount: new FormControl(),
      ssdueamount: new FormControl(),
      ssstatus: new FormControl(),
    });

    this.form = this.fb.group({
      customer: new FormControl('', [Validators.required]),
      event: new FormControl('', [Validators.required]),
      totalCost: new FormControl('', [Validators.required]),
      paidAmount: new FormControl('', [Validators.required]),
      dueAmount: new FormControl('', [Validators.required]),
      status: new FormControl('', [Validators.required]),
    });

    // Filling arrays from server through services
    this.pss.get().subscribe((response) => {
      this.statuses = response;
    });

    this.pkgs.get().subscribe((response) => {
      this.packages = response;
    });

    this.cs.get().subscribe((response) => {
      this.customers = response;
    });

    this.rs.get('payment').subscribe((response) => {
      this.regexes = response;
      this.createForm();
    });

    this.es.get().subscribe((response) => {
      this.events = response;
    });

    this.ets.get().subscribe((response) => {
      this.eventTypes = response;
    });
  }

  /**
   * @description get property values in payment object to the table
   * @param element element names
   * @param reference objects references in payment object
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
   * @description filter payment table (client search)
   */
  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.data.filterPredicate = (payment: Payment, filter: String) => {
      return (
        (csearchData.cscustomername == null ||
          payment.customer.name
            .toLowerCase()
            .includes(csearchData.cscustomername.toLowerCase())) &&
        (csearchData.csdoevent == null ||
          payment.event.doevent
            .toString()
            .toLowerCase()
            .includes(csearchData.csdoevent)) &&
        (csearchData.cseventtype == null ||
          payment.event.eventtype.name
            .toLowerCase()
            .includes(csearchData.cseventtype.toLowerCase())) &&
        (csearchData.cspackage == null ||
          payment.event.packageField.name
            .toLowerCase()
            .includes(csearchData.cspackage.toLowerCase())) &&
        (csearchData.cscount == null ||
          payment.event.count.toString().includes(csearchData.cscount)) &&
        (csearchData.cstotalamount == null ||
          payment.totalCost.toString().includes(csearchData.cstotalamount)) &&
        (csearchData.cspaidamount == null ||
          payment.paidAmount.toString().includes(csearchData.cspaidamount)) &&
        (csearchData.csdueamount == null ||
          payment.dueAmount.toString().includes(csearchData.csdueamount)) &&
        (csearchData.csstatus == null ||
          payment.status.name.toLowerCase().includes(csearchData.csstatus))
      );
    };

    this.data.filter = 'xx';
  }

  /**
   * @description fill payment form when user selected a row in table
   * @param payment selected payment object by the user
   */
  fillForm(payment: Payment) {
    this.enableButtons(false, true, true);

    this.selectedrow = payment;

    this.payment = JSON.parse(JSON.stringify(payment));
    this.oldpayment = JSON.parse(JSON.stringify(payment));

    this.payment.event = this.events.find(
      (g) => g.id === this.payment.event.id
    )!;

    this.payment.customer = this.customers.find(
      (d) => d.id === this.payment.customer.id
    )!;

    this.payment.status = this.statuses.find(
      (d) => d.id === this.payment.status.id
    )!;

    this.form.patchValue(this.payment);

    this.form.markAsPristine();
  }

  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description filter event table according to the selected customer
   */
  filterEvents() {
    let queryData = this.form.controls['customer'].getRawValue();

    let name = queryData.name;
    let mobile = queryData.mobile;
    let query = '';

    if (name != null && name.trim() != '')
      query += '&customerName=' + name.replaceAll(' ', '');

    if (mobile != null && mobile.trim() != '')
      query += '&customerMobile=' + mobile;

    if (query != '') query = query.replace(/^./, '?');

    this.es.search(query.toString()).subscribe((response) => {
      this.events = response;
    });
  }

  /**
   * @description apply total cost for selected event
   */
  filterTotalAmount() {
    let selectedEvent = this.form.controls['event'].getRawValue();
    this.form.controls['totalCost'].setValue(selectedEvent.cost);

    this.form.controls['customer'].setValue(selectedEvent.customer);
  }

  /**
   * @description calculate dueamount and display in form field
   */
  filterDueAmount() {
    let inputAmount = this.form.controls['paidAmount'].getRawValue();
    let totalAmount = this.form.controls['totalCost'].getRawValue();
    // Calculating the due amount and display
    let dueAmount = Number(totalAmount - inputAmount);

    this.form.controls['dueAmount'].setValue(dueAmount);
  }

  /**
   * @description add payment
   */
  add() {
    // Get errors in payment form
    let errors = this.getErrors();

    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Item Add ',
          message: 'You have following Errors <br>' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Get current form value to payment object
      this.payment = this.form.getRawValue();

      let paymentData: string = '';
      paymentData =
        paymentData + '<br>Customer name is : ' + this.payment.customer.name;
      paymentData =
        paymentData + '<br>Total Amount is : ' + this.payment.totalCost;
      paymentData =
        paymentData + '<br>Paid Amount is : ' + this.payment.paidAmount;
      paymentData =
        paymentData + '<br>Due Amount is : ' + this.payment.dueAmount;
      paymentData = paymentData + '<br>Status is : ' + this.payment.status.name;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Payment Add',
          message:
            'Are you sure to Add the folowing Payment? <br> <br>' + paymentData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          this.ps.add(this.payment).subscribe((response) => {
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
              this.ps.get().subscribe((response) => {
                this.payments = response;
                this.data = new MatTableDataSource(this.payments);
                this.data.paginator = this.paginator;
              });

              this.form.reset();
              this.enableButtons(true, false, false);
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status -Payment Add', message: addmessage },
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
   * @description clear payment form
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
        this.oldpayment = undefined!;
        this.form.reset();
        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description update payment
   */
  update() {
    // Get errors in payment form
    let errors = this.getErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Payment Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Getting user updates in payment form
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Payment Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.payment = this.form.getRawValue();

            this.payment.id = this.oldpayment.id;

            this.ps.update(this.payment).subscribe((response) => {
              if (response != undefined) {
                updstatus = response['errors'] == '';

                if (!updstatus) {
                  updmessage = response['errors'];
                  console.log('Update message : ' + updmessage);
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

                this.enableButtons(true, false, false);
                this.updateTable('');
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status -Payment Update',
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
            heading: 'Confirmation - Payment Update',
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

  /**
   * @description delete payment
   */
  delete() {
    // Get current form value to payment object
    this.payment = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Payment Delete',
        message: 'Are you sure to delete the payment? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.payment = this.form.getRawValue();

        // Getting the payment id to be deleted
        let id: number = this.oldpayment.id;

        // Calling delete method in payment service
        this.ps.delete(id).subscribe((response) => {
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
            delmessage = 'Successfully Deleted';
            this.form.reset();

            Object.values(this.form.controls).forEach((control) => {
              control.markAsTouched();
            });
            this.enableButtons(true, false, false);
            this.updateTable('');
          }

          const stsmg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Payment Delete',
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
   * @description update payment table for search query
   * @param query query for payment search
   */
  updateTable(query: string) {
    this.ps.search(query).subscribe((response) => {
      this.payments = response;
      this.data = new MatTableDataSource(this.payments);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description get updates in payment form
   * @returns form control updates
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
   * @description get errors in payment form
   * @returns errors in form controls
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
   * @description create payment form and apply validators
   */
  createForm() {
    this.form.controls['customer'].setValidators([Validators.required]);
    this.form.controls['event'].setValidators([Validators.required]);
    this.form.controls['totalCost'].setValidators([Validators.required]);
    this.form.controls['paidAmount'].setValidators([
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]);
    this.form.controls['dueAmount'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    this.enableButtons(true, false, false);
  }

  /**
   * @description compare function to selected appropriate customer object related to the payment
   * @param customer1 first object
   * @param customer2 second object
   * @returns boolean if objects are equal or not equal
   */
  compare(customer1: Customer, customer2: Customer): boolean {
    return customer1.id === customer2.id;
  }

  /**
   * @description search payments (server search)
   */
  search(): void {
    const ssearchData = this.ssearch.getRawValue();

    let customerName = ssearchData.sscustomername;
    let eventDate = ssearchData.ssdoevent;
    let eventType = ssearchData.sseventtype;
    let eventPackage = ssearchData.sspackage;
    let eventCount = ssearchData.sscount;
    let totalAmount = ssearchData.sstotalamount;
    let paidAmount = ssearchData.sspaidamount;
    let dueAmount = ssearchData.ssdueamount;
    let paymentStatus = ssearchData.ssstatus;

    let query = '';

    if (customerName != null && customerName.trim() != '')
      query += '&customerName=' + customerName.replaceAll(' ', '');

    if (eventDate != null && eventDate.toString().trim() != '') {
      let latestDate = this.dp.transform(eventDate, 'yyyy-MM-dd');
      query += '&eventDate=' + latestDate?.toString();
    }

    if (eventType != null && eventType.trim() != '')
      query += '&eventType=' + eventType.replaceAll(' ', '');

    if (eventPackage != null && eventPackage.trim() != '')
      query += '&eventPackage=' + eventPackage.replaceAll(' ', '');

    if (eventCount != null && eventCount.trim() != '')
      query += '&eventCount=' + eventCount.toString().trim();

    if (totalAmount != null && totalAmount.trim() != '')
      query += '&totalCost=' + totalAmount.toString().trim();

    if (paidAmount != null && paidAmount.trim() != '')
      query += '&paidAmount=' + paidAmount.toString().trim();

    if (dueAmount != null && dueAmount.trim() != '')
      query += '&dueAmount=' + dueAmount.toString().trim();

    if (paymentStatus != null && paymentStatus.trim() != '')
      query += '&status=' + paymentStatus.replaceAll(' ', '');

    if (query != '') query = query.replace(/^./, '?');

    this.updateTable(query);
  }

  /**
   * @description clear search form fields
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
}
