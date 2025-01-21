import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Event } from 'src/app/entity/event';
import { Hall } from 'src/app/entity/hall';
import { HallService } from 'src/app/service/hall.service';
import { RegexService } from 'src/app/service/regex.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-hall',
  templateUrl: './hall.component.html',
  styleUrls: ['./hall.component.css'],
})
export class HallComponent {
  cols = '12';
  public form!: FormGroup;
  public csearch!: FormGroup;

  // Row that user selected
  selectedrow: any;
  hall!: Hall;
  oldhall!: Hall;
  regexes: any;

  // Booleans to disable add, delete and update buttons
  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  columns: string[] = ['Hall Id', 'Hall Name'];
  cscolumns: string[] = [
    'csdoevent',
    'cscustomername',
    'cseventtype',
    'cscost',
    'cseventstatus',
  ];
  headers: string[] = ['Hall Id', 'Hall Name'];
  binders: string[] = ['id', 'name'];

  eventColumns: string[] = [
    'Event Date',
    'Customer Name',
    'Event Type',
    'Cost',
    'Event Status',
  ];

  // Table header names
  eventHeaders: string[] = [
    'Event Date',
    'Customer Name',
    'Event Type',
    'Cost',
    'Event Status',
  ];

  eventBinders: string[] = [
    'doevent',
    'customer.name',
    'eventtype.name',
    'cost',
    'eventstatus.name',
  ];

  csprompts: string[] = [
    'Search by Date',
    'Search by Customer name',
    'Search by Event name',
    'Search by Cost',
    'Search by Event status',
  ];

  halls: Array<Hall> = [];
  events: Array<Event> = [];

  // Data source of the table
  data!: MatTableDataSource<Hall>;

  // For the pagination - using view children since have to use two paginators for one component. Otherwise, view child can be used.
  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  // Data source for the event history
  hallData: MatTableDataSource<Event> = new MatTableDataSource<Event>();

  constructor(
    private hs: HallService,
    private fb: FormBuilder,
    private dg: MatDialog,
    private rs: RegexService
  ) {
    this.hs.get().subscribe((response) => {
      this.halls = response;
      this.data = new MatTableDataSource(this.halls);
      this.data.paginator = this.paginator.toArray()[0];

      this.hallData = new MatTableDataSource(this.events);
      this.hallData.paginator = this.paginator.toArray()[1];
    });

    this.csearch = this.fb.group({
      csdoevent: new FormControl(),
      cscustomername: new FormControl(),
      cseventtype: new FormControl(),
      cscost: new FormControl(),
      cseventstatus: new FormControl(),
    });

    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
    });

    this.rs.get('hall').subscribe((response) => {
      this.regexes = response;
      this.createForm();
    });

    this.enableButtons(true, false, false);
  }

  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.hallData.filterPredicate = (event: Event, filter: string) => {
      return (
        (csearchData.csdoevent == null ||
          event.doevent.toString().includes(csearchData.csdoevent)) &&
        (csearchData.cscustomername == null ||
          event.customer.name
            .toLowerCase()
            .includes(csearchData.cscustomername)) &&
        (csearchData.cseventtype == null ||
          event.eventtype.name
            .toLowerCase()
            .includes(csearchData.cseventtype)) &&
        (csearchData.cscost == null ||
          event.cost.toString().includes(csearchData.cscost)) &&
        (csearchData.cseventstatus == null ||
          event.eventstatus.name
            .toLowerCase()
            .includes(csearchData.cseventstatus))
      );
    };

    this.hallData.filter = 'xx';
    console.log(this.hallData.data.length);
    console.log(this.hallData.paginator?.length);
  }

  /**
   * @description add a hall
   */
  add() {
    // Get form errors if there any
    let errors = this.getErrors();

    // If there are errors, display them in a dialog
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Hall Add',
          message: 'You have following errors <br>' + errors,
        },
      });

      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Apply current value in the form to the object
      this.hall = this.form.getRawValue();

      let hallData: string = '';

      hallData = hallData + '<br> Hall name is : ' + this.hall.name;

      // Display confirm dialog with hall details to be addded
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Hall Add',
          message:
            'Are you sure to add the following hall? <br> <br>' + hallData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server not found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          this.hs.add(this.hall).subscribe((response) => {
            if (response != undefined) {
              addstatus = response['errors'] == '';
              if (!addstatus) {
                // If there are errors in the server response, apply that to the message string
                addmessage = response['errors'];
              }
            } else {
              addstatus = false;
              addmessage = 'Content not found';
            }

            if (addstatus) {
              addmessage = 'Successfully saved';

              // Updating the table after adding the hall
              this.hs.get().subscribe((response) => {
                this.halls = response;
                this.data = new MatTableDataSource(this.halls);
                this.data.paginator = this.paginator.toArray()[0];
              });

              // Clear the form after adding the hall
              this.form.reset();
            }

            // Display the status in a dialog
            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: {
                heading: 'Status -Hall Add',
                message: addmessage,
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
    }
  }

  /**
   * @description delete a hall
   */
  delete() {
    // Get the current value in the form
    this.hall = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server not found';

    // Confirm dialog for the user
    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Hall Delete',
        message: 'Are you sure to delete the hall? <br> <br>',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.hall = this.form.getRawValue();
        let id: number = this.oldhall.id;

        // Calling hall service to delete the hall
        this.hs.delete(id).subscribe((response) => {
          if (response != undefined) {
            delstatus = response['errors'] == '';

            // If there are errors in server response body, apply them to the message string
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
              control.markAllAsTouched();
            });

            // Updating the table after deleting the hall
            this.hs.get().subscribe((response) => {
              this.halls = response;
              this.data = new MatTableDataSource(this.halls);
              this.data.paginator = this.paginator.toArray()[0];
            });
          }

          // Display the status using a dialog
          const stsmsg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Hall Delete',
              message: delmessage,
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
  }

  /**
   * @description clear the user form
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
        this.oldhall = undefined!;
        this.form.reset();
        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });
      }
    });
  }

  /**
   * @description update a hall
   */
  update() {
    // Get errors if there any
    let errors = this.getErrors();

    // Display errors in a dialog box
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Hall Update',
          message: 'You have following errors <br> ' + errors,
        },
      });

      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Get what updated user done to the hall (always name)
      let updates: string = this.getUpdates();

      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server not found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Hall update',
            message:
              'Are you sure to save following updates? <br> <br>' + updates,
          },
        });

        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            // apply the current form value to existing hall object
            this.hall = this.form.getRawValue();
            this.hall.id = this.oldhall.id;

            // calling update function in the hall service
            this.hs.update(this.hall).subscribe((response) => {
              if (response != undefined) {
                updstatus = response['errors'] == '';

                // if there are server errors, apply them to message string
                if (!updstatus) {
                  updmessage = response['errors'];
                }
              } else {
                updstatus = false;
                updmessage = 'Content not found';
              }

              if (updstatus) {
                updmessage = 'Successfully updated';
                this.form.reset();

                Object.values(this.form.controls).forEach((control) => {
                  control.markAllAsTouched();
                });

                // Updating the table after updating the hall
                this.hs.get().subscribe((response) => {
                  this.halls = response;
                  this.data = new MatTableDataSource(this.halls);
                  this.data.paginator = this.paginator.toArray()[0];
                });
              }

              // Display the status using a dialog box
              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status - Hall Update',
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
        // If nothing changed by the user, display the message in the dialog box
        const updmsg = this.dg.open(MessageComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Hall Update',
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
   * @description get updates done by the user in the formm
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
   * @description create hall form and apply appropriate validators
   */
  createForm() {
    this.form.controls['name'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['name']['regex']),
    ]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  getProperty(element: {}, reference: string): string {
    const value = reference.split('.').reduce((o, a) => {
      //@ts-ignore;
      return o[a];
    }, element) as string;
    return value;
  }

  /**
   *@description Fill details form when user clicked a table row
   */
  fillForm(hall: Hall) {
    this.enableButtons(false, true, true);
    this.selectedrow = hall;

    this.hall = JSON.parse(JSON.stringify(hall));
    this.oldhall = JSON.parse(JSON.stringify(hall));

    this.form.patchValue(this.hall);
    this.form.markAsPristine();

    this.getEventHistory(this.selectedrow);
  }

  /**
   * @description Get event history for the selected hall
   */
  getEventHistory(hall: Hall) {
    this.hs.getHistory(hall).subscribe((response) => {
      this.events = response;

      this.hallData = new MatTableDataSource(this.events);
      this.hallData.paginator = this.paginator.toArray()[1];
    });
  }

  /**
   * @description apply criteria to disable or enable buttons
   * @param add param for add button
   * @param upd param for update button
   * @param del param for delete button
   */
  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  /**
   * @description enable add button if the name input is empty
   */
  chkAddBtn() {
    if (this.form.controls['name'].value == '') {
      this.enaadd = true;
    }
  }
}
