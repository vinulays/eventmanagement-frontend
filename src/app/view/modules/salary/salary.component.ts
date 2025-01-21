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
import { Designation } from 'src/app/entity/designation';
import { Employee } from 'src/app/entity/employee';
import { Salary } from 'src/app/entity/salary';
import { DesignationService } from 'src/app/service/designation.service';
import { EmployeeService } from 'src/app/service/employee.service';
import { RegexService } from 'src/app/service/regex.service';
import { SalaryService } from 'src/app/service/salary.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.component.html',
  styleUrls: ['./salary.component.css'],
})
export class SalaryComponent {
  cols = '12';

  columns: string[] = [
    'Employee Number',
    'Employee NIC',
    'Employee Name',
    'Employee Designation',
    'Salary Start Date',
    'Salary End Date',
    'Amount',
  ];

  headers: string[] = [
    'Employee Number',
    'Employee NIC',
    'Employee Name',
    'Employee Designation',
    'Salary Start Date',
    'Salary End Date',
    'Amount',
  ];

  cscolumns: string[] = [
    'csempnumber',
    'csempnic',
    'csempname',
    'csempdesignation',
    'csstartdate',
    'csenddate',
    'csamount',
  ];

  binders: string[] = [
    'employee.number',
    'employee.nic',
    'employee.fullname',
    'employee.designation.name',
    'salaryStartDate',
    'salaryEndDate',
    'amount',
  ];

  csprompts: string[] = [
    'Search by employee number',
    'Search by employee nic',
    'Search by employee name',
    'Search by designation',
    'Search by start date',
    'Search by end date',
    'Search by amount',
  ];

  regexes: any;

  salaries: Array<Salary> = [];
  employees: Array<Employee> = [];
  designations: Array<Designation> = [];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  salary!: Salary;
  oldsalary!: Salary;

  selectedrow: any;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  // Data source and paginator for salary table
  data: MatTableDataSource<Salary> = new MatTableDataSource<Salary>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ss: SalaryService,
    private es: EmployeeService,
    private rs: RegexService,
    private fb: FormBuilder,
    private ds: DesignationService,
    private dg: MatDialog,
    private dp: DatePipe
  ) {
    this.es.get().subscribe((response) => {
      this.employees = response;
    });

    this.ss.get().subscribe((response) => {
      this.salaries = response;
      this.data = new MatTableDataSource(this.salaries);
      this.data.paginator = this.paginator;
    });

    this.rs.get('salary').subscribe((response) => {
      this.regexes = response;
      this.createForm();
    });

    this.ds.get().subscribe((respone) => {
      this.designations = respone;
    });
    this.csearch = this.fb.group({
      csempnumber: new FormControl(),
      csempname: new FormControl(),
      csempnic: new FormControl(),
      csempdesignation: new FormControl(),
      csstartdate: new FormControl(),
      csenddate: new FormControl(),
      csamount: new FormControl(),
    });

    this.ssearch = this.fb.group({
      ssempnumber: new FormControl(),
      ssempname: new FormControl(),
      ssempnic: new FormControl(),
      ssempdesignation: new FormControl(),
      ssstartdate: new FormControl(),
      ssenddate: new FormControl(),
      ssamount: new FormControl(),
    });

    this.form = this.fb.group({
      employee: new FormControl('', [Validators.required]),
      salaryStartDate: new FormControl('', [Validators.required]),
      salaryEndDate: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
    });
  }

  /**
   * @description filter salary table (client search)
   */
  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.data.filterPredicate = (salary: Salary, filter: String) => {
      return (
        (csearchData.csempnumber == null ||
          salary.employee.number.includes(csearchData.csempnumber)) &&
        (csearchData.csempnic == null ||
          salary.employee.nic.includes(csearchData.csempnic)) &&
        (csearchData.csempname == null ||
          salary.employee.fullname
            .toLowerCase()
            .includes(csearchData.csempname)) &&
        (csearchData.csempdesignation == null ||
          salary.employee.designation.name
            .toLowerCase()
            .includes(csearchData.csempdesignation.toLowerCase())) &&
        (csearchData.csstartdate == null ||
          salary.salaryStartDate
            .toString()
            .includes(csearchData.csstartdate)) &&
        (csearchData.csenddate == null ||
          salary.salaryStartDate.toString().includes(csearchData.csenddate)) &&
        (csearchData.csamount == null ||
          salary.amount.toString().includes(csearchData.csamount))
      );
    };

    this.data.filter = 'xx';
  }

  /**
   * @description create payment form and apply validators
   */
  createForm() {
    this.form.controls['employee'].setValidators([Validators.required]);
    this.form.controls['salaryStartDate'].setValidators([Validators.required]);
    this.form.controls['salaryEndDate'].setValidators([Validators.required]);
    this.form.controls['amount'].setValidators([
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    this.enableButtons(true, false, false);
  }

  /**
   * @description fill salary form when user selected a row in the table
   * @param salary selected salary object by the user
   */
  fillForm(salary: Salary) {
    this.enableButtons(false, true, true);

    this.selectedrow = salary;

    this.salary = JSON.parse(JSON.stringify(salary));
    this.oldsalary = JSON.parse(JSON.stringify(salary));

    this.salary.employee = this.employees.find(
      (g) => g.id === this.salary.employee.id
    )!;

    this.salary.employee.designation = this.designations.find(
      (g) => g.id === this.salary.employee.designation.id
    )!;

    this.form.patchValue(this.salary);
    this.form.markAsPristine();
  }

  /**
   * @description get property values in salary object to the table
   * @param element element names
   * @param reference object references in payment object
   * @returns property values
   */
  getProperty(element: {}, reference: string): string {
    const value = reference.split('.').reduce((o, a) => {
      //@ts-ignore;
      return o[a];
    }, element) as string;
    return value;
  }
  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description add salary
   */
  add() {
    // Get salary form errors
    let errors = this.getErrors();

    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Salary Add ',
          message: 'You have following Errors <br>' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Get current form value to salary object
      this.salary = this.form.getRawValue();

      // Fixing dates for timezone issue. Otherwise, date will save as one day off in database
      this.salary.salaryStartDate = this.correctDateFormat(
        this.salary.salaryStartDate
      );
      this.salary.salaryEndDate = this.correctDateFormat(
        this.salary.salaryEndDate
      );

      let latestStartDate = this.dp.transform(
        this.salary.salaryStartDate,
        'yyyy-MM-dd'
      );

      let latestEndDate = this.dp.transform(
        this.salary.salaryEndDate,
        'yyyy-MM-dd'
      );

      let salaryData: string = '';
      salaryData =
        salaryData + '<br>Employee number is : ' + this.salary.employee.number;
      salaryData =
        salaryData + '<br>Employee name is : ' + this.salary.employee.fullname;
      salaryData =
        salaryData +
        '<br>Employee designation is : ' +
        this.salary.employee.designation.name;
      salaryData = salaryData + '<br>Start date is : ' + latestStartDate;
      salaryData = salaryData + '<br>End date is : ' + latestEndDate;
      salaryData =
        salaryData + '<br>Amount is : ' + this.salary.amount.toString();

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Salary Add',
          message:
            'Are you sure to Add the folowing Salary? <br> <br>' + salaryData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          this.ss.add(this.salary).subscribe((response) => {
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
              this.ss.get().subscribe((response) => {
                this.salaries = response;
                this.data = new MatTableDataSource(this.salaries);
                this.data.paginator = this.paginator;
              });

              this.form.reset();
              this.enableButtons(true, false, false);
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status -Salary Add', message: addmessage },
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
   * @description correct date format to fix saving the date one day off
   * @param date date to change format
   * @returns formatted date
   */
  correctDateFormat(date: Date) {
    var offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset);
  }

  /**
   * @description clear salary form
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
        this.oldsalary = undefined!;
        this.form.reset();

        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description update salary
   */
  update() {
    // Getting errors in salary form
    let errors = this.getErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Salary Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Getting user updates in salary form
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Salary Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            // Set current form value to salary object
            this.salary = this.form.getRawValue();

            // Set previous salary id to updated salary object
            this.salary.id = this.oldsalary.id;

            // Correcting date formats to fix one day off issue

            if (this.form.controls['salaryStartDate'].dirty) {
              this.salary.salaryStartDate = this.correctDateFormat(
                this.salary.salaryStartDate
              );
            }

            if (this.form.controls['salaryEndDate'].dirty) {
              this.salary.salaryEndDate = this.correctDateFormat(
                this.salary.salaryEndDate
              );
            }

            // Calling update method in salary service
            this.ss.update(this.salary).subscribe((response) => {
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
                  heading: 'Status -Salary Update',
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

  /**
   * @description salary delete
   */
  delete() {
    // Set current form value to salary object
    this.salary = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Salary Delete',
        message: 'Are you sure to delete the salary? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.salary = this.form.getRawValue();

        // Get salary id to be deleted
        let id: number = this.oldsalary.id;

        // Calling delete method in salary service
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
              heading: 'Status -Salary Delete',
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
   * @description update salary table for user query
   * @param query query to search salaries
   */
  updateTable(query: string) {
    this.ss.search(query).subscribe((response) => {
      this.salaries = response;
      this.data = new MatTableDataSource(this.salaries);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description get updates in salary form
   * @returns updates in form controls
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
   * @description get errors in salary form
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
   * @description search salaries (server search)
   */
  search(): void {
    const ssearchData = this.ssearch.getRawValue();

    let employeeName = ssearchData.ssempname;
    let employeeNumber = ssearchData.ssempnumber;
    let nic = ssearchData.ssempnic;
    let designation = ssearchData.ssempdesignation;
    let startDate = ssearchData.ssstartdate;
    let endDate = ssearchData.ssenddate;
    let amount = ssearchData.ssamount;

    let query = '';

    if (employeeName != null && employeeName.trim() != '')
      query += '&employeeName=' + employeeName.replaceAll(' ', '');

    if (employeeNumber != null && employeeNumber.trim() != '')
      query += '&employeeNumber=' + employeeNumber.replaceAll(' ', '');

    if (nic != null && nic.trim() != '')
      query += '&employeeNIC=' + nic.replaceAll(' ', '');

    if (designation != null && designation.trim() != '')
      query += '&designation=' + designation.replaceAll(' ', '');

    if (startDate != null && startDate.toString().trim() != '') {
      let latestDate = this.dp.transform(startDate, 'yyyy-MM-dd');
      query += '&startDate=' + latestDate?.toString().replaceAll(' ', '');
    }

    if (endDate != null && endDate.toString().trim() != '') {
      let latestDate = this.dp.transform(endDate, 'yyyy-MM-dd');
      query += '&endDate=' + latestDate?.toString().replaceAll(' ', '');
    }

    if (amount != null && amount.trim() != '')
      query += '&amount=' + amount.replaceAll(' ', '');

    if (query != '') query = query.replace(/^./, '?');

    console.log(query);
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
