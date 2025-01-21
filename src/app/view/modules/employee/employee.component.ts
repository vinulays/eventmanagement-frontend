import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Employee } from 'src/app/entity/employee';
import { EmployeeService } from 'src/app/service/employee.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Gender } from 'src/app/entity/gender';
import { Designation } from 'src/app/entity/designation';
import { DesignationService } from 'src/app/service/designation.service';
import { GenderService } from 'src/app/service/gender.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';
import { RegexService } from 'src/app/service/regex.service';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';
import { EmployeeStatus } from 'src/app/entity/employeeStatus';
import { EmployeeStatusService } from 'src/app/service/employeeStatus.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent {
  cols = '12';

  columns: string[] = [
    'Number',
    'Calling name',
    'Gender',
    'Designation',
    'Full Name',
  ];

  cscolumns: string[] = [
    'csnumber',
    'cscallingname',
    'csgender',
    'csdesignation',
    'csname',
  ];

  headers: string[] = [
    'Number',
    'Calling Name',
    'Gender',
    'Designation',
    'Full Name',
  ];

  binders: string[] = [
    'number',
    'callingname',
    'gender.name',
    'designation.name',
    'fullname',
  ];

  csprompts: string[] = [
    'Search by Number',
    'Search by Name',
    'Search by Gender',
    'Search by Designation',
    'Search by Full Name',
  ];
  employees: Array<Employee> = [];
  genders: Array<Gender> = [];
  designations: Array<Designation> = [];
  regexes: any;
  employeestatuses: Array<EmployeeStatus> = [];

  // Form groups
  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  employee!: Employee;
  oldemployee!: Employee;

  // User selected employee row
  selectedrow: any;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  // Data source for employee table with paginator
  data: MatTableDataSource<Employee> = new MatTableDataSource<Employee>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  imageempurl: string = 'assets/userold.png';

  constructor(
    private es: EmployeeService,
    private fb: FormBuilder,
    private ds: DesignationService,
    private gs: GenderService,
    private dg: MatDialog,
    private rs: RegexService,
    private empS: EmployeeStatusService,
    private dp: DatePipe
  ) {
    // Setting data form employee table from API
    this.es.get().subscribe((response) => {
      this.employees = response;
      this.data = new MatTableDataSource(this.employees);
      this.data.paginator = this.paginator;
    });

    this.csearch = this.fb.group({
      csnumber: new FormControl(),
      cscallingname: new FormControl(),
      csgender: new FormControl(),
      csdesignation: new FormControl(),
      csname: new FormControl(),
    });

    this.ssearch = this.fb.group({
      ssnumber: new FormControl(),
      sscallingname: new FormControl(),
      ssgender: new FormControl(),
      ssdesignation: new FormControl(),
      ssname: new FormControl(),
    });

    this.form = this.fb.group({
      number: new FormControl('', [Validators.required]),
      fullname: new FormControl('', [Validators.required]),
      callingname: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      nic: new FormControl('', [Validators.required]),
      dobirth: new FormControl('', [Validators.required]),
      photo: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required]),
      land: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      doassignment: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      employeestatus: new FormControl('', [Validators.required]),
    });

    this.gs.get().subscribe((response) => {
      this.genders = response;
    });

    this.ds.get().subscribe((response) => {
      this.designations = response;
    });

    this.rs.get('employee').subscribe((response) => {
      this.regexes = response;
      this.createForm();
    });

    this.empS.get().subscribe((response) => {
      this.employeestatuses = response;
    });
  }

  /**
   * @description filter employee table (client search)
   */
  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.data.filterPredicate = (employee: Employee, filter: String) => {
      return (
        (csearchData.csnumber == null ||
          employee.number.toLowerCase().includes(csearchData.csnumber)) &&
        (csearchData.cscallingname == null ||
          employee.callingname
            .toLowerCase()
            .includes(csearchData.cscallingname)) &&
        (csearchData.csgender == null ||
          employee.gender.name
            .toLowerCase()
            .includes(csearchData.csgender.toLowerCase())) &&
        (csearchData.csdesignation == null ||
          employee.designation.name
            .toLowerCase()
            .includes(csearchData.csdesignation.toLowerCase())) &&
        (csearchData.csname == null ||
          employee.fullname
            .toLowerCase()
            .includes(csearchData.csname.toLowerCase()))
      );
    };

    this.data.filter = 'xx';
  }

  /**
   * @description get property value of employee
   * @param element element name
   * @param reference refernce name in employee object
   * @returns propert value
   */
  getProperty(element: {}, reference: string): string {
    const value = reference.split('.').reduce((o, a) => {
      //@ts-ignore;
      return o[a];
    }, element) as string;
    return value;
  }

  /**
   * @description search and update employee table (server search)
   */
  search(): void {
    const ssearchData = this.ssearch.getRawValue();

    let number = ssearchData.ssnumber;
    let callingname = ssearchData.sscallingname;
    let gender = ssearchData.ssgender;
    let ssname = ssearchData.ssname;
    let designation = ssearchData.ssdesignation;

    let query = '';

    if (number != null && number.trim() != '')
      query += '&number=' + number.trim();
    if (callingname != null && callingname.trim() != '')
      query += '&callingname=' + callingname.replaceAll(' ', '');
    if (gender != null && gender.trim() != '')
      query += '&gender=' + gender.replaceAll(' ', '');
    if (ssname != null && ssname.trim() != '')
      query += '&fullname=' + ssname.replaceAll(' ', '');
    if (designation != null && designation.trim() != '')
      query += '&designation=' + designation.replaceAll(' ', '');

    if (query != '') query = query.replace(/^./, '?');
    console.log(query);

    this.updateTable(query);
  }

  /**
   * @description update employee table according to search query
   * @param query query to update table
   */
  updateTable(query: string) {
    this.es.search(query).subscribe((response) => {
      this.employees = response;
      this.data = new MatTableDataSource(this.employees);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description clear search query and form fields
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
   * @description select employee image from files
   * @param e selected files
   */
  selectImage(e: any): void {
    if (e.target.files) {
      let reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = (event: any) => {
        this.imageempurl = event.target.result;
        this.form.controls['photo'].clearValidators();
      };
    }
  }

  /**
   * @description clear the image file
   */
  clearImage(): void {
    this.imageempurl = 'assets/userold.png';
    this.form.controls['photo'].setErrors({
      required: true,
    });
  }

  /**
   * @description add employee
   */
  add() {
    // Getting errors in the form
    let errors = this.getErrors();

    // If there are errors, display them
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Employee Add ',
          message: 'You have following Errors <br>' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Setting current form values to employee object
      this.employee = this.form.getRawValue();

      // Fixing the dates. Otherwise, it will save one day off in the database due to timezone difference
      this.employee.doassignment = this.correctDateFormat(
        this.employee.doassignment
      );
      this.employee.dobirth = this.correctDateFormat(this.employee.dobirth);

      // Changing the date format to display when adding employee
      let latestDOB = this.dp.transform(this.employee.dobirth, 'yyyy-MM-dd');
      let latestDOA = this.dp.transform(
        this.employee.doassignment,
        'yyyy-MM-dd'
      );

      // Setting employee image
      this.employee.photo = btoa(this.imageempurl);

      // Displaying employee data
      let empdata: string = '';
      empdata = empdata + '<br>Number is : ' + this.employee.number;
      empdata = empdata + '<br>Fullname is : ' + this.employee.fullname;
      empdata = empdata + '<br>Callingname is : ' + this.employee.callingname;
      empdata = empdata + '<br>Date of Birth is : ' + latestDOB;
      empdata = empdata + '<br>Date of Assignment is : ' + latestDOA;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Employee Add',
          message:
            'Are you sure to Add the folowing Employee? <br> <br>' + empdata,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          // Calling the add method through employee service
          this.es.add(this.employee).subscribe((response) => {
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
                this.employees = response;
                this.data = new MatTableDataSource(this.employees);
                this.data.paginator = this.paginator;
              });

              // Form reset and clear employee image file
              this.form.reset();
              this.clearImage();
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status -Employee Add', message: addmessage },
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
   * @description get errors in the form fields
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
   * @description create employee form and set required validators and regex patterns from server.
   */
  createForm() {
    this.form.controls['number'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['number']['regex']),
    ]);
    this.form.controls['fullname'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['fullname']['regex']),
    ]);
    this.form.controls['callingname'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['callingname']['regex']),
    ]);
    this.form.controls['gender'].setValidators([Validators.required]);
    this.form.controls['nic'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['nic']['regex']),
    ]);
    this.form.controls['dobirth'].setValidators([Validators.required]);
    this.form.controls['photo'].setValidators([Validators.required]);
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
    this.form.controls['designation'].setValidators([Validators.required]);
    this.form.controls['doassignment'].setValidators([Validators.required]);
    this.form.controls['description'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['description']['regex']),
    ]);
    this.form.controls['employeestatus'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    // Enable add button
    this.enableButtons(true, false, false);
  }

  /**
   * @description fill employee form when user selected a row in the table
   * @param employee user selected employee object row in the table
   */
  fillForm(employee: Employee) {
    // disable add button and enable update and delete button
    this.enableButtons(false, true, true);

    // set value to selected row to apply css for selected row
    this.selectedrow = employee;

    this.employee = JSON.parse(JSON.stringify(employee));
    this.oldemployee = JSON.parse(JSON.stringify(employee));

    if (this.employee.photo != null) {
      this.imageempurl = atob(this.employee.photo);
      this.form.controls['photo'].clearValidators();
    } else {
      this.clearImage();
    }

    this.employee.photo = '';

    // Find appropriate properties from arrays
    this.employee.gender = this.genders.find(
      (g) => g.id === this.employee.gender.id
    )!;
    this.employee.designation = this.designations.find(
      (d) => d.id === this.employee.designation.id
    )!;

    this.employee.employeestatus = this.employeestatuses.find(
      (s) => s.id === this.employee.employeestatus.id
    )!;

    this.form.patchValue(this.employee);
    this.form.markAsPristine();
  }

  /**
   * @description update employee
   */
  update() {
    // Get current errors in the form
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
      // Get user updates in the form
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Employee Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.employee = this.form.getRawValue();

            // Changing date form for timezone difference
            if (this.form.controls['dobirth'].dirty) {
              this.employee.dobirth = this.correctDateFormat(
                this.employee.dobirth
              );
            }

            if (this.form.controls['doassignment'].dirty) {
              this.employee.doassignment = this.correctDateFormat(
                this.employee.doassignment
              );
            }

            // Setting photo according to user changes
            if (this.form.controls['photo'].dirty)
              this.employee.photo = btoa(this.imageempurl);
            else this.employee.photo = this.oldemployee.photo;

            // Set id from previouse employee object
            this.employee.id = this.oldemployee.id;

            // Calling update to API through employee service
            this.es.update(this.employee).subscribe((response) => {
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
                this.clearImage();
                Object.values(this.form.controls).forEach((control) => {
                  control.markAsTouched();
                });

                this.enableButtons(true, false, false);
                this.updateTable('');
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status -Employee Update',
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
   *
   * @param add boolean for add button
   * @param upd boolean for update button
   * @param del boolean for delete button
   */
  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description get user updates in the form fields
   * @returns updates in the form
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
   * @description clear the employee form
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
        this.oldemployee = undefined!;
        this.form.reset();
        this.clearImage();
        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description delete employee
   */
  delete() {
    this.employee = this.form.getRawValue();

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
        this.employee = this.form.getRawValue();
        let id: number = this.oldemployee.id;

        console.log('ID' + id);

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
            this.clearImage();
            Object.values(this.form.controls).forEach((control) => {
              control.markAsTouched();
            });
            this.enableButtons(true, false, false);
            this.updateTable('');
          }

          const stsmg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Employee Delete',
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
