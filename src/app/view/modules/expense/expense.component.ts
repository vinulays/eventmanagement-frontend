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
import { Expense } from 'src/app/entity/expense';
import { ExpenseType } from 'src/app/entity/expenseType';
import { Item } from 'src/app/entity/item';
import { Supplier } from 'src/app/entity/supplier';
import { ExpenseTypeService } from 'src/app/service/expense-type.service';
import { ExpenseService } from 'src/app/service/expense.service';
import { ItemService } from 'src/app/service/item.service';
import { RegexService } from 'src/app/service/regex.service';
import { SupplierService } from 'src/app/service/supplier.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrls: ['./expense.component.css'],
})
export class ExpenseComponent {
  cols = '12';

  columns: string[] = [
    'Expense Type',
    'Description',
    'Supplier Name',
    'Item Name',
    'Date',
    'Cost',
  ];

  cscolumns: string[] = [
    'csexpenseType',
    'csdescription',
    'cssupplier',
    'csitem',
    'csdate',
    'cscost',
  ];

  headers: string[] = [
    'Expense Type',
    'Description',
    'Supplier Name',
    'Item Name',
    'Date',
    'Cost',
  ];

  binders: string[] = [
    'expenseType.name',
    'description',
    'supplier.fullname',
    'item.name',
    'date',
    'cost',
  ];

  csprompts: string[] = [
    'Search by Expense Type',
    'Search by Description',
    'Search by Supplier Name',
    'Search by Item Name',
    'Search by Date',
    'Search by Cost',
  ];

  regexes: any;

  expenses: Array<Expense> = [];
  expenseTypes: Array<ExpenseType> = [];
  suppliers: Array<Supplier> = [];
  items: Array<Item> = [];
  supplierItems: Array<Item> = [];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  expense!: Expense;
  oldexpense!: Expense;

  selectedrow: any;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  // Expense table data source and paginator
  data: MatTableDataSource<Expense> = new MatTableDataSource<Expense>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private es: ExpenseService,
    private ss: SupplierService,
    private is: ItemService,
    private ets: ExpenseTypeService,
    private rs: RegexService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private dp: DatePipe
  ) {
    // Setting array values from server
    this.es.get().subscribe((respone) => {
      this.expenses = respone;
      this.data = new MatTableDataSource(this.expenses);
      this.data.paginator = this.paginator;
    });

    this.ets.get().subscribe((response) => {
      this.expenseTypes = response;
    });

    this.ss.get().subscribe((response) => {
      this.suppliers = response;
    });

    this.is.get().subscribe((response) => {
      this.items = response;
    });

    this.rs.get('expense').subscribe((response) => {
      this.regexes = response;
      this.createForm();
    });

    this.csearch = this.fb.group({
      csexpenseType: new FormControl(),
      csdescription: new FormControl(),
      cssupplier: new FormControl(),
      csitem: new FormControl(),
      csdate: new FormControl(),
      cscost: new FormControl(),
    });

    this.ssearch = this.fb.group({
      ssexpenseType: new FormControl(),
      ssdescription: new FormControl(),
      sssupplier: new FormControl(),
      ssitem: new FormControl(),
      ssdate: new FormControl(),
      sscost: new FormControl(),
    });

    this.form = this.fb.group({
      expenseType: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      supplier: new FormControl({ value: null, disabled: true }),
      item: new FormControl({ value: null, disabled: true }),
      date: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required]),
    });
  }

  /**
   * @description get values for expense object references
   * @param element element names
   * @param reference object reference
   * @returns property values
   */
  getProperty(element: any, reference: string): string {
    const value = reference.split('.').reduce((o, a) => {
      //@ts-ignore;

      if (o[a] != null) return o[a];
      else return '-';
    }, element) as string;
    return value;
  }

  /**
   * @description fill expense for when user selected a row in table
   * @param expense expense object that user selected
   */
  fillForm(expense: Expense) {
    this.enableButtons(false, true, true);

    // Enable supplier, item select options according to expense type
    this.enableSupplier2(expense);

    this.selectedrow = expense;

    this.expense = JSON.parse(JSON.stringify(expense));
    this.oldexpense = JSON.parse(JSON.stringify(expense));

    if (expense.supplier != null) {
      this.expense.supplier = this.suppliers.find(
        (g) => g.id === this.expense.supplier.id
      )!;
    }

    if (expense.supplier != null) {
      this.filterItems(expense.supplier);
    }

    if (expense.item != null) {
      this.expense.item = this.supplierItems.find(
        (g) => g.id === this.expense.item.id
      )!;
    }

    this.expense.expenseType = this.expenseTypes.find(
      (g) => g.id === this.expense.expenseType.id
    )!;

    this.form.patchValue(this.expense);
    this.form.markAsPristine();
  }

  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description add expense
   */
  add() {
    let errors = this.getErrors();

    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Expense Add ',
          message: 'You have following Errors <br>' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Set current expense form value for expense object
      this.expense = this.form.getRawValue();

      // Correct date format for timezone difference
      this.expense.date = this.correctDateFormat(this.expense.date);

      let latestDate = this.dp.transform(this.expense.date, 'yyyy-MM-dd');

      let expenseData: string = '';
      expenseData =
        expenseData + '<br>Expense type is : ' + this.expense.expenseType.name;
      expenseData =
        expenseData + '<br>Description is : ' + this.expense.description;
      expenseData = expenseData + '<br>Expense date is : ' + latestDate;
      expenseData =
        expenseData + '<br>Cost is : ' + this.expense.cost.toString();
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Expense Add',
          message:
            'Are you sure to Add the folowing Expense? <br> <br>' + expenseData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          this.es.add(this.expense).subscribe((response) => {
            console.log(response);
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
                this.expenses = response;
                this.data = new MatTableDataSource(this.expenses);
                this.data.paginator = this.paginator;
              });

              this.form.reset();
              // Enable add button
              this.enableButtons(true, false, false);
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status -Expense Add', message: addmessage },
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
   * @description clear expense form
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
        this.oldexpense = undefined!;
        this.form.reset();

        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description update expense
   */
  update() {
    let errors = this.getErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Expense Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Expense Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.expense = this.form.getRawValue();

            this.expense.id = this.oldexpense.id;

            // Correcting date format to fix one day off issue
            if (this.form.controls['date'].dirty) {
              this.expense.date = this.correctDateFormat(this.expense.date);
            }

            this.es.update(this.expense).subscribe((response) => {
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

                this.enableButtons(true, false, false);
                this.updateTable('');
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status -Expense Update',
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
            heading: 'Confirmation - Expense Update',
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
   * @description delete expense
   */
  delete() {
    // Set selected form values to expense object
    this.expense = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Expense Delete',
        message: 'Are you sure to delete the Expense? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.expense = this.form.getRawValue();
        let id: number = this.oldexpense.id;

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
              heading: 'Status -Expense Delete',
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
   * @description update expense table for query
   * @param query query to search expenses
   */
  updateTable(query: string) {
    this.es.search(query).subscribe((response) => {
      this.expenses = response;
      this.data = new MatTableDataSource(this.expenses);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description get user updates in expense form
   * @returns update in form controls
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
   * @description filter items according to the selected supplier by user
   * @param supplier supplier object to filter items
   */
  filterItems(supplier: Supplier) {
    this.supplierItems = [];

    this.items.forEach((i) => {
      if (i.supplier.id === supplier.id) {
        this.supplierItems.push(i);
      }
    });
  }

  /**
   * @description get errors in the expense form
   * @returns errors in form
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
   * @description create expense form and set appropriate validators
   */
  createForm() {
    this.form.controls['expenseType'].setValidators([Validators.required]);
    this.form.controls['description'].setValidators([Validators.required]);

    this.form.controls['date'].setValidators([Validators.required]);
    this.form.controls['cost'].setValidators([
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    this.enableButtons(true, false, false);
  }

  /**
   * @description search expenses using query (server search)
   */
  search(): void {
    const ssearchData = this.ssearch.getRawValue();

    let expenseType = ssearchData.ssexpenseType;
    let description = ssearchData.ssdescription;
    let supplier = ssearchData.sssupplier;
    let date = ssearchData.ssdate;
    let cost = ssearchData.sscost;

    let query = '';

    if (expenseType != null && expenseType.name.trim() != '')
      query += '&type=' + expenseType.name.replaceAll(' ', '');

    if (description != null && description.trim() != '')
      query += '&description=' + description.replaceAll(' ', '');

    if (supplier != null && supplier.fullname.trim() != '')
      query += '&supplierName=' + supplier.fullname.replaceAll(' ', '');

    if (date != null && date.toString().trim() != '') {
      let latestDate = this.dp.transform(date, 'yyyy-MM-dd');
      query += '&date=' + latestDate?.toString();
    }

    if (cost != null && cost.trim() != '')
      query += '&cost=' + cost.replaceAll(' ', '');

    if (query != '') query = query.replace(/^./, '?');

    console.log(query);
    this.updateTable(query);
  }

  /**
   * @description clear search form
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

  enableSupplier() {
    let expenseType = this.form.controls['expenseType'].getRawValue();
    console.log(expenseType.name);

    if (expenseType.name === 'Supplier Payment') {
      this.form.controls['supplier'].enable();
      this.form.controls['item'].enable();
    } else {
      this.form.controls['supplier'].disable();
      this.form.controls['item'].disable();

      // this.form.controls['supplier'].setValue('');
      // this.form.controls['item'].setValue('');
    }
  }

  /**
   * @description enable supplier, item select options if expense type is supplier payment
   * @param expense expense user selected
   */
  enableSupplier2(expense: Expense) {
    if (expense.expenseType.name === 'Supplier Payment') {
      this.form.controls['supplier'].enable();
      this.form.controls['item'].enable();
    } else {
      this.form.controls['supplier'].disable();
      this.form.controls['item'].disable();
    }
  }

  /**
   * @description fix date format for timezone difference, otherwise dates will save one day off
   * @param date date to fix
   * @returns fixed date
   */
  correctDateFormat(date: Date) {
    var offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset);
  }
}
