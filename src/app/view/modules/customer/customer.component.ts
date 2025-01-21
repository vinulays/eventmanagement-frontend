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
import { Gender } from 'src/app/entity/gender';
import { CustomerService } from 'src/app/service/customer.service';
import { GenderService } from 'src/app/service/gender.service';
import { RegexService } from 'src/app/service/regex.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent {
  cols = '12';

  // Column names for the table
  columns: string[] = [
    'Name',
    'Gender',
    'Address',
    'Mobile number',
    'Landline number',
  ];

  // formcontrol names for client  search (without server)
  cscolumns: string[] = [
    'csname',
    'csgender',
    'csaddress',
    'csmobile',
    'csland',
  ];

  // Column names for the table
  headers: string[] = [
    'Name',
    'Gender',
    'Address',
    'Mobile number',
    'Landline number',
  ];

  // Customer object properties for each column
  binders: string[] = ['name', 'gender.name', 'address', 'mobile', 'land'];

  // Client search prompts to appear in each search field
  csprompts: string[] = [
    'Search by name',
    'Search by gender',
    'Search by address',
    'Search by mobile number',
    'Search by landline number',
  ];

  // Arrays to store customers and genders
  customers: Array<Customer> = [];
  genders: Array<Gender> = [];

  // Regex patterns in customer entity from backend
  regexes: any;

  // Form groups for main form,client and server search forms
  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  // Customer object to store details
  customer!: Customer;

  // Customer object to store details when user clicked a row in the table
  oldcustomer!: Customer;

  // Identifying seleted object in the table by user
  selectedrow: any;

  // Booleans to enable / disable buttons
  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  // Applying datasource for the mat table
  data: MatTableDataSource<Customer> = new MatTableDataSource<Customer>();

  // Applying paginator for the mat table
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private cs: CustomerService,
    private gs: GenderService,
    private rs: RegexService,
    private dg: MatDialog,
    private fb: FormBuilder
  ) {
    // Getting all the customers in the database and fill the table
    this.cs.get().subscribe((response) => {
      this.customers = response;
      this.data = new MatTableDataSource(this.customers);
      this.data.paginator = this.paginator;
    });

    // Getting genders from the database
    this.gs.get().subscribe((respone) => {
      this.genders = respone;
    });

    // Creating client search form
    this.csearch = this.fb.group({
      csname: new FormControl(),
      csgender: new FormControl(),
      csaddress: new FormControl(),
      csmobile: new FormControl(),
      csland: new FormControl(),
    });

    // Creating server search form
    this.ssearch = this.fb.group({
      ssname: new FormControl(),
      ssgender: new FormControl(),
      ssaddress: new FormControl(),
      ssmobile: new FormControl(),
      ssland: new FormControl(),
    });

    // Creating customer form
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required]),
      land: new FormControl('', [Validators.required]),
    });

    // Getting regexg pattern in the customer entity from the backend
    this.rs.get('customer').subscribe((response) => {
      this.regexes = response;

      this.createForm();
    });
  }

  /**
   * @description adding a customer
   */
  add() {
    // Getting errors in the form
    let errors = this.getErrors();

    // If there are errors, display them via a mat dialog box
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Customer Add',
          message: 'You have following errors <br> ' + errors,
        },
      });

      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // If no errors get set the current values in the form to the customer form
      this.customer = this.form.getRawValue();

      let customerData: string = '';

      // Display customer details in the add menu
      customerData = customerData + '<br> Name is : ' + this.customer.name;
      customerData =
        customerData + '<br> Gender is : ' + this.customer.gender.name;
      customerData =
        customerData + '<br> Address is : ' + this.customer.address;
      customerData =
        customerData + '<br> Mobile number is : ' + this.customer.mobile;
      customerData =
        customerData + '<br> Landline number is : ' + this.customer.land;

      // Confirm add dialog
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Customer Add',
          message:
            'Are you sure to add the following customer? <br> <br>' +
            customerData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server not found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          this.cs.add(this.customer).subscribe((response) => {
            if (response != undefined) {
              addstatus = response['errors'] == '';

              if (!addstatus) {
                addmessage = response['errors'];
              }
            } else {
              addstatus = false;
              addmessage = 'Content not found';
            }

            if (addstatus) {
              addmessage = 'Successfully saved';

              this.cs.get().subscribe((response) => {
                this.customers = response;
                this.data = new MatTableDataSource(this.customers);
                this.data.paginator = this.paginator;
              });

              this.form.reset();
            }

            // Display status of customer add with server errors if there are any
            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status - Customer Add', message: addmessage },
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
   * @description clear the customer form
   */
  clear() {
    // Confirm dialog box
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Clear Form',
        message:
          'Are you sure to clear the Form? <br> <br> You will lost your updates',
      },
    });

    // If user press yes, reset the form and enable add button
    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.oldcustomer = undefined!;
        this.form.reset();
        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description update customer
   */
  update() {
    // Getting errors in the form
    let errors = this.getErrors();

    // If there are errors, display them in the mat dialog
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Customer Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Getting user updates in the form
      let updates: string = this.getUpdates();

      // If there are updates display the confirm dialog for the user
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Customer Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });

        // If user pressed yes, update customer
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            // Set current customer form values to customer object
            this.customer = this.form.getRawValue();

            // Set previous customer id to the updated customer id
            this.customer.id = this.oldcustomer.id;

            // Call update request in the API
            this.cs.update(this.customer).subscribe((response) => {
              if (response != undefined) {
                console.log(response);

                updstatus = response['errors'] == '';

                if (!updstatus) {
                  updmessage = response['errors'];
                  console.log('Update message : ' + updmessage);
                }
              } else {
                updstatus = false;
                updmessage = 'Content not found';
              }

              // If successfully updated, reset the form and update the table
              if (updstatus) {
                updmessage = 'Successfully Updated';
                this.form.reset();
                Object.values(this.form.controls).forEach((control) => {
                  control.markAsTouched();
                });

                this.enableButtons(true, false, false);
                this.updateTable('');
              }

              // Display customer update status in a mat dialog
              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status -Customer Update',
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
        // If no user updates dislpay nothing changed in the dialog box
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Supplier Update',
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
   * @description delete a customer
   */
  delete() {
    // Set current form value to the customer object
    this.customer = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    // Confirm dialog for the user
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Customer Delete',
        message: 'Are you sure to delete the customer? <br> <br> ',
      },
    });

    // If user pressed yes, delete the customer
    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        // Set the current form values to the customer object
        this.customer = this.form.getRawValue();

        // Get the id of the selected customer object
        let id: number = this.oldcustomer.id;

        // Make delete request to the backend
        this.cs.delete(id).subscribe((response) => {
          if (response != undefined) {
            delstatus = response['errors'] == '';

            if (!delstatus) {
              delmessage = response['errors'];
            }
          } else {
            delstatus = false;
            delmessage = 'Content not found';
          }

          // If successfully deleted, reset the form, enable add button and update table
          if (delstatus) {
            delmessage = 'Successfully Deleted';
            this.form.reset();
            Object.values(this.form.controls).forEach((control) => {
              control.markAsTouched();
            });
            this.enableButtons(true, false, false);
            this.updateTable('');
          }

          // Display customer delete status in mat dialog
          const stsmg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Customer Delete',
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
   * @description search database for the customers (server search)
   */
  search(): void {
    // Get current server search form values
    const ssearchData = this.ssearch.getRawValue();

    // Get respective object properties
    let name = ssearchData.ssname;
    let gender = ssearchData.ssgender;
    let address = ssearchData.ssaddress;
    let mobile = ssearchData.ssmobile;
    let land = ssearchData.ssland;

    // Building search query
    let query = '';

    if (name != null && name.trim() != '')
      query += '&name=' + name.replaceAll(' ', '');

    if (gender != null && gender != '') query += '&gender=' + gender.name;

    if (address != null && address.trim() != '')
      query += '&address=' + address.replaceAll(' ', '');

    if (mobile != null && mobile.trim() != '')
      query += '&mobile=' + mobile.replaceAll(' ', '');
    if (land != null && land.trim() != '')
      query += '&land=' + land.replaceAll(' ', '');

    // Apply ? to the beginning of the search query
    if (query != '') query = query.replace(/^./, '?');

    // Update the table
    this.updateTable(query);
  }

  /**
   * @description clear server search form
   */
  clearSearch() {
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
   * @description update table for searched customers
   * @param query query for search
   */
  updateTable(query: string) {
    this.cs.search(query).subscribe((response) => {
      this.customers = response;
      this.data = new MatTableDataSource(this.customers);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description get user updates in the form
   * @returns updates of the form
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
   * @description get errors in the form
   * @returns errors in the form fields
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
   * @description filter customer table (client search)
   */
  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.data.filterPredicate = (customer: Customer, filter: string) => {
      return (
        (csearchData.csname == null ||
          customer.name
            .toLowerCase()
            .includes(csearchData.csname.toLowerCase())) &&
        (csearchData.csgender == null ||
          customer.gender.name
            .toLowerCase()
            .includes(csearchData.csgender.toLowerCase())) &&
        (csearchData.csaddress == null ||
          customer.address
            .toLowerCase()
            .includes(csearchData.csaddress.toLowerCase())) &&
        (csearchData.csmobile == null ||
          customer.mobile.includes(csearchData.csmobile)) &&
        (csearchData.csland == null ||
          customer.land.includes(csearchData.csland))
      );
    };

    this.data.filter = 'xx';
  }

  /**
   * @description
   * @param customer selected customer row
   */
  fillForm(customer: Customer) {
    this.enableButtons(false, true, true);

    this.selectedrow = customer;

    this.customer = JSON.parse(JSON.stringify(customer));
    this.oldcustomer = JSON.parse(JSON.stringify(customer));

    this.customer.gender = this.genders.find(
      (g) => g.id === this.customer.gender.id
    )!;

    this.form.patchValue(this.customer);
    this.form.markAsPristine();
  }

  /**
   * @description create customer form with setted validators
   */
  createForm() {
    this.form.controls['name'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['name']['regex']),
    ]);
    this.form.controls['gender'].setValidators([Validators.required]);

    this.form.controls['address'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['address']['regex']),
    ]);
    this.form.controls['mobile'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['mobile']['regex']),
    ]);
    this.form.controls['land'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['land']['regex']),
    ]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    this.enableButtons(true, false, false);
  }

  /**
   * @description enable / disable btns
   * @param add boolean for add btn
   * @param upd boolean for update btn
   * @param del boolean for delete btn
   */
  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description get property value for the given reference name in the customer
   * @param element element names
   * @param reference reference name in the object
   * @returns propert value
   */
  getProperty(element: {}, reference: string): string {
    const value = reference.split('.').reduce((o, a) => {
      //@ts-ignore;
      return o[a];
    }, element) as string;
    return value;
  }
}
