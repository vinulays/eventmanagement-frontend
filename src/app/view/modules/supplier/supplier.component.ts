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
import { Supplier } from 'src/app/entity/supplier';
import { RegexService } from 'src/app/service/regex.service';
import { SupplierService } from 'src/app/service/supplier.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css'],
})
export class SupplierComponent {
  cols = '12';

  // Column names in supplier table
  columns: string[] = [
    'Full name',
    'NIC',
    'Address',
    'Email',
    'Mobile number',
    'Account number',
  ];

  cscolumns: string[] = [
    'csfullname',
    'csnic',
    'csaddress',
    'csemail',
    'csmobilenumber',
    'csaccountnumber',
  ];

  headers: string[] = [
    'Full name',
    'NIC',
    'Address',
    'Email',
    'Mobile number',
    'Account number',
  ];

  binders: string[] = [
    'fullname',
    'nic',
    'address',
    'email',
    'mobile',
    'accountNo',
  ];

  csprompts: string[] = [
    'Search by full name',
    'Search by nic',
    'Search by address',
    'Search by email',
    'Search by mobile number',
    'Search by account number',
  ];

  suppliers: Array<Supplier> = [];
  regexes: any;

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  supplier!: Supplier;
  oldsupplier!: Supplier;

  selectedrow: any;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  // Data source and paginator for supplier table
  data: MatTableDataSource<Supplier> = new MatTableDataSource<Supplier>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private ss: SupplierService,
    private rs: RegexService,
    private dg: MatDialog
  ) {
    // Getting supplier from get api call
    this.ss.get().subscribe((response) => {
      this.suppliers = response;
      this.data = new MatTableDataSource(this.suppliers);
      this.data.paginator = this.paginator;
    });

    this.csearch = this.fb.group({
      csfullname: new FormControl(),
      csnic: new FormControl(),
      csaddress: new FormControl(),
      csemail: new FormControl(),
      csmobilenumber: new FormControl(),
      csaccountnumber: new FormControl(),
    });

    this.ssearch = this.fb.group({
      ssfullname: new FormControl(),
      ssnic: new FormControl(),
      ssaddress: new FormControl(),
      ssemail: new FormControl(),
      ssmobilenumber: new FormControl(),
      ssaccountnumber: new FormControl(),
    });

    this.form = this.fb.group({
      fullname: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      nic: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required]),
      accountNo: new FormControl('', [Validators.required]),
    });

    // Getting regex patterns in supplier entity in backend
    this.rs.get('supplier').subscribe((response) => {
      this.regexes = response;
      console.log(this.regexes);

      this.createForm();
    });
  }

  /**
   * @description filter supplier table (client search)
   */
  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.data.filterPredicate = (supplier: Supplier, filter: string) => {
      return (
        (csearchData.csfullname == null ||
          supplier.fullname
            .toLowerCase()
            .includes(csearchData.csfullname.toLowerCase())) &&
        (csearchData.csnic == null ||
          supplier.nic.includes(csearchData.csnic)) &&
        (csearchData.csaddress == null ||
          supplier.address
            .toLowerCase()
            .includes(csearchData.csaddress.toLowerCase())) &&
        (csearchData.csemail == null ||
          supplier.email
            .toLowerCase()
            .includes(csearchData.csemail.toLowerCase())) &&
        (csearchData.csmobilenumber == null ||
          supplier.mobile.includes(csearchData.csmobilenumber)) &&
        (csearchData.csaccountnumber == null ||
          supplier.accountNo.includes(csearchData.csaccountnumber))
      );
    };

    this.data.filter = 'xx';
  }

  /**
   * @description add supplier
   */
  add() {
    // Getting errors in the supplier form
    let errors = this.getErrors();

    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Supplier Add',
          message: 'You have following errors <br> ' + errors,
        },
      });

      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Setting current form value to supplier object
      this.supplier = this.form.getRawValue();
      let supplierData: string = '';

      supplierData = supplierData + '<br> Name is : ' + this.supplier.fullname;
      supplierData =
        supplierData + '<br> Address is : ' + this.supplier.address;
      supplierData =
        supplierData + '<br> Mobile number is : ' + this.supplier.mobile;
      supplierData = supplierData + '<br> Email is : ' + this.supplier.email;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Supplier Add',
          message:
            'Are you sure to add the following supplier? <br> <br>' +
            supplierData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server not found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          // Calling add method in supplier service
          this.ss.add(this.supplier).subscribe((response) => {
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

              // Update supplier table after addition
              this.ss.get().subscribe((response) => {
                this.suppliers = response;
                this.data = new MatTableDataSource(this.suppliers);
                this.data.paginator = this.paginator;
              });

              this.form.reset();
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status - Supplier Add', message: addmessage },
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
   * @description clear the supplier form
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
        this.oldsupplier = undefined!;
        this.form.reset();
        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description update supplier
   */
  update() {
    // Get errors in supplier form
    let errors = this.getErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Supplier Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Getting user updates in supplier table
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Supplier Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.supplier = this.form.getRawValue();

            this.supplier.id = this.oldsupplier.id;

            this.ss.update(this.supplier).subscribe((response) => {
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
                  heading: 'Status -Supplier Update',
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
   * @description delete supplier
   */
  delete() {
    // Getting current supplier form value to supplier object
    this.supplier = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Supplier Delete',
        message: 'Are you sure to delete the supplier? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.supplier = this.form.getRawValue();

        // Setting selected supplier id to be deleted
        let id: number = this.oldsupplier.id;

        // Calling delete method in supplier service
        this.ss.delete(id).subscribe((response) => {
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
              heading: 'Status -Supplier Delete',
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
   * @description get updates in form controls
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
   * @description fill supplier form when user selected a row
   * @param supplier user selected supplier row
   */
  fillForm(supplier: Supplier) {
    this.enableButtons(false, true, true);

    this.selectedrow = supplier;

    this.supplier = JSON.parse(JSON.stringify(supplier));
    this.oldsupplier = JSON.parse(JSON.stringify(supplier));

    this.form.patchValue(this.supplier);
    this.form.markAsPristine();
  }

  /**
   * @description get errors in supplier form
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
   * @description getting property values in supplier object to the table
   * @param element element names
   * @param reference object references to supplier object
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
   * @description create supplier form and apply appropriate validators
   */
  createForm() {
    this.form.controls['fullname'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['fullname']['regex']),
    ]);
    this.form.controls['address'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['address']['regex']),
    ]);
    this.form.controls['email'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['email']['regex']),
    ]);
    this.form.controls['nic'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['nic']['regex']),
    ]);
    this.form.controls['mobile'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['mobile']['regex']),
    ]);
    this.form.controls['accountNo'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['accountNo']['regex']),
    ]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    this.enableButtons(true, false, false);
  }

  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description search supplier (server search)
   */
  search(): void {
    const ssearchData = this.ssearch.getRawValue();

    let fullname = ssearchData.ssfullname;
    let nic = ssearchData.ssnic;
    // let address = ssearchData.ssaddress;
    let email = ssearchData.ssemail;
    let accountnumber = ssearchData.ssaccountnumber;

    let query = '';

    if (fullname != null && fullname.trim() != '')
      query += '&fullname=' + fullname.replaceAll(' ', '');

    if (nic != null && nic.trim() != '')
      query += '&nic=' + nic.replaceAll(' ', '');

    if (email != null && email.trim() != '')
      query += '&email=' + email.replaceAll(' ', '');

    if (accountnumber != null && accountnumber.trim() != '')
      query += '&accountNo=' + accountnumber.replaceAll(' ', '');

    if (query != '') query = query.replace(/^./, '?');
    console.log(query);

    this.updateTable(query);
  }

  /**
   * @description update table according to user search
   * @param query query to search
   */
  updateTable(query: string) {
    this.ss.search(query).subscribe((response) => {
      this.suppliers = response;
      this.data = new MatTableDataSource(this.suppliers);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description clear search form fields
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
}
