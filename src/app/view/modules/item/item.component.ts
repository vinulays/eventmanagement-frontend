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
import { Item } from 'src/app/entity/item';
import { Supplier } from 'src/app/entity/supplier';
import { ItemService } from 'src/app/service/item.service';
import { RegexService } from 'src/app/service/regex.service';
import { SupplierService } from 'src/app/service/supplier.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css'],
})
export class ItemComponent {
  cols = '12';

  columns: string[] = [
    'Name',
    'Description',
    'Price (LKR)',
    'Quantity',
    'Supplier',
  ];

  cscolumns: string[] = [
    'csname',
    'csdescription',
    'csprice',
    'csquantity',
    'cssupplier',
  ];

  headers: string[] = [
    'Name',
    'Description',
    'Price (LKR)',
    'Quantity',
    'Supplier',
  ];

  binders: string[] = [
    'name',
    'description',
    'price',
    'quantity',
    'supplier.fullname',
  ];

  csprompts: string[] = [
    'Search by Name',
    'Search by Description',
    'Search by price',
    'Search by Quantity',
    'Search by Supplier',
  ];

  regexes: any;

  items: Array<Item> = [];
  suppliers: Array<Supplier> = [];

  public csearch!: FormGroup;
  public ssearch!: FormGroup;
  public form!: FormGroup;

  item!: Item;
  olditem!: Item;

  selectedrow: any;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  // Data source and paginator for item table
  data: MatTableDataSource<Item> = new MatTableDataSource<Item>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private is: ItemService,
    private dg: MatDialog,
    private rs: RegexService,
    private ss: SupplierService,
    private fb: FormBuilder
  ) {
    this.is.get().subscribe((response) => {
      this.items = response;
      this.data = new MatTableDataSource(this.items);
      this.data.paginator = this.paginator;
    });

    this.ss.get().subscribe((response) => {
      this.suppliers = response;
    });

    this.rs.get('item').subscribe((response) => {
      this.regexes = response;
      this.createForm();
    });

    this.csearch = this.fb.group({
      csname: new FormControl(),
      csdescription: new FormControl(),
      csprice: new FormControl(),
      csquantity: new FormControl(),
      cssupplier: new FormControl(),
    });

    this.ssearch = this.fb.group({
      ssname: new FormControl(),
      ssdescription: new FormControl(),
      ssprice: new FormControl(),
      ssquantity: new FormControl(),
      sssupplier: new FormControl(),
    });

    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      quantity: new FormControl('', [Validators.required]),
      supplier: new FormControl('', [Validators.required]),
    });
  }

  /**
   * @description filter item table for client search
   */
  filterTable(): void {
    const csearchData = this.csearch.getRawValue();

    this.data.filterPredicate = (item: Item, filter: String) => {
      return (
        (csearchData.csname == null ||
          item.name.toLowerCase().includes(csearchData.csname)) &&
        (csearchData.csdescription == null ||
          item.description.toLowerCase().includes(csearchData.csdescription)) &&
        (csearchData.csprice == null ||
          item.price.toString().includes(csearchData.csprice)) &&
        (csearchData.csquantity == null ||
          item.quantity.toString().includes(csearchData.csquantity)) &&
        (csearchData.cssupplier == null ||
          item.supplier.fullname
            .toLowerCase()
            .includes(csearchData.cssupplier.toLowerCase()))
      );
    };

    this.data.filter = 'xx';
  }

  /**
   * @description fill item form when user selected a row in table
   * @param item user selected item row in the table
   */
  fillForm(item: Item) {
    this.enableButtons(false, true, true);

    this.selectedrow = item;

    this.item = JSON.parse(JSON.stringify(item));
    this.olditem = JSON.parse(JSON.stringify(item));

    this.item.supplier = this.suppliers.find(
      (g) => g.id === this.item.supplier.id
    )!;

    this.form.patchValue(this.item);
    this.form.markAsPristine();
  }

  /**
   * @description get property values in item
   * @param element element names
   * @param reference object reference in item
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
   * @description add item
   */
  add() {
    // Get errors in item form
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
      // Set current form value to item object
      this.item = this.form.getRawValue();

      let itemData: string = '';
      itemData = itemData + '<br>Item name is : ' + this.item.name;
      itemData = itemData + '<br>Description is : ' + this.item.description;
      itemData = itemData + '<br>Price is : ' + this.item.price;
      itemData = itemData + '<br>Quantity is : ' + this.item.quantity;
      itemData = itemData + '<br>Supplier is : ' + this.item.supplier.fullname;
      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Item Add',
          message:
            'Are you sure to Add the folowing Employee? <br> <br>' + itemData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          // Calling add method in item service
          this.is.add(this.item).subscribe((response) => {
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
              this.is.get().subscribe((response) => {
                this.items = response;
                this.data = new MatTableDataSource(this.items);
                this.data.paginator = this.paginator;
              });

              this.form.reset();
              this.enableButtons(true, false, false);
            }

            const stsmsg = this.dg.open(MessageComponent, {
              width: '500px',
              data: { heading: 'Status -Item Add', message: addmessage },
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
        this.olditem = undefined!;
        this.form.reset();

        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description update item
   */
  update() {
    // Get errors in item form
    let errors = this.getErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Item Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Get user updates in item form
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Item Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.item = this.form.getRawValue();

            this.item.id = this.olditem.id;

            this.is.update(this.item).subscribe((response) => {
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
                  heading: 'Status -Item Update',
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
   * @description item delete
   */
  delete() {
    // Set current form value to item object
    this.item = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Item Delete',
        message: 'Are you sure to delete the item? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.item = this.form.getRawValue();
        let id: number = this.olditem.id;

        this.is.delete(id).subscribe((response) => {
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

            // Update table after deletion
            this.updateTable('');
          }

          const stsmg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Item Delete',
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
   * @returns updates in form
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
   * @description create item form and apply appropriate validators
   */
  createForm() {
    this.form.controls['name'].setValidators([
      Validators.required,
      Validators.pattern(this.regexes['name']['regex']),
    ]);
    this.form.controls['description'].setValidators([Validators.required]);
    this.form.controls['price'].setValidators([
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]);
    this.form.controls['quantity'].setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]+$/),
    ]);
    this.form.controls['supplier'].setValidators([Validators.required]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    // Enable add button
    this.enableButtons(true, false, false);
  }

  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }

  search(): void {
    const ssearchData = this.ssearch.getRawValue();

    let name = ssearchData.ssname;
    let price = ssearchData.ssprice;
    let quantity = ssearchData.ssquantity;
    let supplier = ssearchData.sssupplier;

    let query = '';

    if (name != null && name.trim() != '')
      query += '&name=' + name.replaceAll(' ', '');

    if (price != null && price.trim() != '')
      query += '&price=' + price.toString().trim();
    if (quantity != null && quantity.trim() != '')
      query += '&quantity=' + quantity.toString().trim();
    if (supplier != null && supplier.trim() != '')
      query += '&supplier=' + supplier.replaceAll(' ', '');

    if (query != '') query = query.replace(/^./, '?');

    console.log(query);
    this.updateTable(query);
  }

  updateTable(query: string) {
    this.is.search(query).subscribe((response) => {
      this.items = response;
      this.data = new MatTableDataSource(this.items);
      this.data.paginator = this.paginator;
    });
  }

  /**
   * @description clear search form fields (server search)
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
