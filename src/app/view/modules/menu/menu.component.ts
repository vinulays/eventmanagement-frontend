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
import { Menu } from 'src/app/entity/menu';
import { SubMenu } from 'src/app/entity/submenu';
import { MenuService } from 'src/app/service/menu.service';
import { RegexService } from 'src/app/service/regex.service';
import { SubmenuService } from 'src/app/service/submenu.service';
import { ConfirmComponent } from 'src/app/util/dialog/confirm/confirm.component';
import { MessageComponent } from 'src/app/util/dialog/message/message.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent {
  cols = '12';

  // Column names in menu table
  columns: string[] = ['Menu Number', 'Name', 'Price Per Person'];

  // Column names in sub menu table
  subMenuColumns: string[] = ['Submenu Name', 'Submenu Ingredients'];

  headers: string[] = ['Menu Number', 'Name', 'Price Per Person'];

  subMenuHeaders: string[] = ['Submenu Name', 'Submenu Ingredients'];

  // Menu object references
  binders: string[] = ['id', 'name', 'price'];

  // Submenu object references
  subMenuBinders: string[] = ['name', 'ingredients'];

  // Defining regex patterns for both menu and submenu
  regexes: any;
  menuRegexes: any;

  menus: Array<Menu> = [];
  submenus: Array<SubMenu> = [];

  public form!: FormGroup;
  public subMenuForm!: FormGroup;

  menu!: Menu;
  oldmenu!: Menu;

  submenu!: SubMenu;
  oldsubmenu!: SubMenu;

  selectedrow: any;
  selectedSubRow: any;

  enaadd: boolean = false;
  enaupd: boolean = false;
  enadel: boolean = false;

  enaaddSub: boolean = false;
  enaupdSub: boolean = false;
  enadelSub: boolean = false;

  // Data source for menu table. didn't use paginator
  data: MatTableDataSource<Menu> = new MatTableDataSource<Menu>();

  // Table data source for submenu table
  subMenuData: MatTableDataSource<SubMenu> = new MatTableDataSource<SubMenu>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private ms: MenuService,
    private fb: FormBuilder,
    private rs: RegexService,
    private dg: MatDialog,
    private sms: SubmenuService
  ) {
    // Getting menus form get API call
    this.ms.get().subscribe((response) => {
      this.menus = response;
      this.data = new MatTableDataSource(this.menus);
      this.subMenuData.paginator = this.paginator;
      console.log(this.menus);
    });

    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      // subMenuList: new FormControl(''),
    });

    this.subMenuForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      ingredients: new FormControl('', [Validators.required]),
    });

    // Getting regex patterns for menu and submenu from backend
    this.rs.get('submenu').subscribe((respone) => {
      this.regexes = respone;
      this.createSubMenuForm();
    });

    this.rs.get('menu').subscribe((respone) => {
      this.menuRegexes = respone;
      this.createForm();
    });
  }

  /**
   * @description fill user form when user selected a row in table
   * @param menu menu selected by the user
   */
  fillForm(menu: Menu) {
    this.enableButtons(false, true, true);

    this.selectedrow = menu;

    this.menu = JSON.parse(JSON.stringify(menu));
    this.oldmenu = JSON.parse(JSON.stringify(menu));

    this.form.patchValue(this.menu);
    this.form.markAsPristine();

    this.fillSubMenus(menu);
  }

  /**
   * @description fill submenu form when user selected a row in submenu table
   * @param submenu submenu selected by the user
   */
  fillSubMenuForm(submenu: SubMenu) {
    this.enableSubButtons(false, true, true);

    this.selectedSubRow = submenu;

    this.submenu = JSON.parse(JSON.stringify(submenu));
    this.oldsubmenu = JSON.parse(JSON.stringify(submenu));

    this.subMenuForm.patchValue(this.submenu);
    this.form.markAsPristine();
  }

  /**
   * @description update submenu table when user selected a menu from menu table
   * @param menu menu that user selected from menu table
   */
  fillSubMenus(menu: Menu) {
    this.submenus = menu.subMenuList;

    this.subMenuData = new MatTableDataSource(this.submenus);
    this.subMenuData.paginator = this.paginator;

    this.enableSubButtons(true, false, false);
  }

  enableButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaadd = add;
    this.enaupd = upd;
    this.enadel = del;
  }
  enableSubButtons(add: boolean, upd: boolean, del: boolean) {
    this.enaaddSub = add;
    this.enaupdSub = upd;
    this.enadelSub = del;
  }

  /**
   * @description get property values from respective objects
   * @param element element names
   * @param reference object references in menu and submenu objects
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
   * @description add menu
   */
  add() {
    // Getting errors in menu form
    let errors = this.getErrors();

    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Submenu Add ',
          message: 'You have following Errors <br>' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Gettting current form value in menu form
      this.menu = this.form.getRawValue();

      let menuData: string = '';
      menuData = menuData + '<br>Menu name is : ' + this.menu.name;
      menuData = menuData + '<br>Price per person is : ' + this.menu.price;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Menu Add',
          message:
            'Are you sure to Add the folowing Menu? <br> <br>' + menuData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          this.ms.add(this.menu).subscribe((response) => {
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
              this.ms.get().subscribe((response) => {
                this.menus = response;
                this.data = new MatTableDataSource(this.menus);
              });

              this.form.reset();
              this.enableButtons(true, false, false);
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
   * @description clear menu form
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
        this.oldmenu = undefined!;
        this.form.reset();

        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableButtons(true, false, false);
      }
    });
  }

  /**
   * @description update menu
   */
  update() {
    // Getting errors in menu form
    let errors = this.getErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Menu Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Getting user updates in menu form
      let updates: string = this.getUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Menu Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.menu = this.form.getRawValue();

            this.menu.id = this.oldmenu.id;
            this.menu.subMenuList = this.oldmenu.subMenuList;

            this.ms.update(this.menu).subscribe((response) => {
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

                this.ms.get().subscribe((response) => {
                  this.menus = response;
                  this.data = new MatTableDataSource(this.menus);
                });

                this.form.reset();
                this.enableButtons(true, false, false);
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status -Menu Update',
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
            heading: 'Confirmation - Menu Update',
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
   * @description delete menu
   */
  delete() {
    // Setting current menu form value to menu object
    this.menu = this.form.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Submenu Delete',
        message: 'Are you sure to delete the Submenu? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.menu = this.form.getRawValue();
        let id: number = this.oldmenu.id;

        this.ms.delete(id).subscribe((response) => {
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

            // Update menu table after delete
            this.ms.get().subscribe((response) => {
              this.menus = response;
              this.data = new MatTableDataSource(this.menus);

              // Clear sub menu table after menu delete
              this.subMenuData = new MatTableDataSource<SubMenu>();
              this.subMenuData.paginator = this.paginator;
            });
          }

          const stsmg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Menu Delete',
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
   * @description add submenu
   */
  addSubMenu() {
    // Getting errors in submenu form
    let errors = this.getSubMenuErrors();

    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Submenu Add ',
          message: 'You have following Errors <br>' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Setting current submenu form value to submenu object
      this.submenu = this.subMenuForm.getRawValue();

      // Getting current selected menu id
      let menuID = this.menu.id;

      // Add current submenu to menu's submenu list
      this.menu.subMenuList.push(this.submenu);

      let menuData: string = '';
      menuData = menuData + '<br>Submenu name is : ' + this.submenu.name;
      menuData =
        menuData + '<br>Submenu ingredients are : ' + this.submenu.ingredients;

      const confirm = this.dg.open(ConfirmComponent, {
        width: '500px',
        data: {
          heading: 'Confirmation - Submenu Add',
          message:
            'Are you sure to Add the folowing Employee? <br> <br>' + menuData,
        },
      });

      let addstatus: boolean = false;
      let addmessage: string = 'Server Not Found';

      confirm.afterClosed().subscribe(async (result) => {
        if (result) {
          // Calling add method in menu service
          this.ms.add(this.menu).subscribe((response) => {
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
              this.ms.getByID(menuID).subscribe((response) => {
                this.menu = response;
                this.subMenuData = new MatTableDataSource(
                  this.menu.subMenuList
                );
                this.subMenuData.paginator = this.paginator;
              });

              // Updating menus after addition
              this.ms.get().subscribe((response) => {
                this.menus = response;
                this.data = new MatTableDataSource(this.menus);
              });

              this.subMenuForm.reset();
              this.enableButtons(true, false, false);
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
   * @description clear submenu form
   */
  clearSubMenu() {
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
        this.oldsubmenu = undefined!;
        this.subMenuForm.reset();

        Object.values(this.form.controls).forEach((control) => {
          control.markAllAsTouched();
        });

        this.enableSubButtons(true, false, false);
      }
    });
  }

  /**
   * @description update submenu form
   */
  updateSubMenu() {
    // Getting submenu form errors
    let errors = this.getSubMenuErrors();
    if (errors != '') {
      const errmsg = this.dg.open(MessageComponent, {
        width: '500px',
        data: {
          heading: 'Errors - Submenu Update ',
          message: 'You have following Errors <br> ' + errors,
        },
      });
      errmsg.afterClosed().subscribe(async (result) => {
        if (!result) {
          return;
        }
      });
    } else {
      // Getting user updates in submenu form
      let updates: string = this.getSubMenuUpdates();
      if (updates != '') {
        let updstatus: boolean = false;
        let updmessage: string = 'Server Not Found';

        const confirm = this.dg.open(ConfirmComponent, {
          width: '500px',
          data: {
            heading: 'Confirmation - Submenu Update',
            message:
              'Are you sure to Save folowing Updates? <br> <br>' + updates,
          },
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result) {
            this.submenu = this.subMenuForm.getRawValue();
            let menuID = this.menu.id;
            this.submenu.id = this.oldsubmenu.id;

            let indexToUpdate = this.menu.subMenuList.findIndex(
              (s) => s.id === this.submenu.id
            );

            console.log('index : ' + indexToUpdate);

            this.menu.subMenuList[indexToUpdate].name = this.submenu.name;
            this.menu.subMenuList[indexToUpdate].ingredients =
              this.submenu.ingredients;

            this.ms.update(this.menu).subscribe((response) => {
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
                this.subMenuForm.reset();

                Object.values(this.form.controls).forEach((control) => {
                  control.markAsTouched();
                });

                this.enableButtons(true, false, false);

                // Updating submenu table
                this.ms.getByID(menuID).subscribe((response) => {
                  this.menu = response;
                  this.subMenuData = new MatTableDataSource(
                    this.menu.subMenuList
                  );
                  this.subMenuData.paginator = this.paginator;
                });

                // Updating menu table
                this.ms.get().subscribe((response) => {
                  this.menus = response;
                  this.data = new MatTableDataSource(this.menus);
                });
              }

              const stsmsg = this.dg.open(MessageComponent, {
                width: '500px',
                data: {
                  heading: 'Status -Submenu Update',
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
            heading: 'Confirmation - Submenu Update',
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
   * @description delete submenu
   */
  deleteSubMenu() {
    // Getting current submenu form value
    this.submenu = this.subMenuForm.getRawValue();

    let delstatus: boolean = false;
    let delmessage: string = 'Server Not Found';

    const confirm = this.dg.open(ConfirmComponent, {
      width: '500px',
      data: {
        heading: 'Confirmation - Submenu Delete',
        message: 'Are you sure to delete the sub menu? <br> <br> ',
      },
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.submenu = this.subMenuForm.getRawValue();
        this.submenu.id = this.oldsubmenu.id;

        // Getting current selected menu id
        let menuID = this.menu.id;

        // Getting index of submenu to delete
        let indexToDelete = this.menu.subMenuList.findIndex(
          (s) => s.id === this.submenu.id
        );

        // Delete submenu object from menu's submenu list using splice method
        this.menu.subMenuList.splice(indexToDelete, 1);

        // Calling delete method in submenu service
        this.sms.delete(this.submenu.id).subscribe((response) => {
          console.log(response);
        });

        // Calling update method in menu service
        this.ms.update(this.menu).subscribe((response) => {
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
            this.subMenuForm.reset();

            Object.values(this.form.controls).forEach((control) => {
              control.markAsTouched();
            });
            this.enableButtons(true, false, false);

            // Update submenu table
            this.ms.getByID(menuID).subscribe((response) => {
              this.menu = response;
              this.subMenuData = new MatTableDataSource(this.menu.subMenuList);
              this.subMenuData.paginator = this.paginator;
            });

            // Updating menu table
            this.ms.get().subscribe((response) => {
              this.menus = response;
              this.data = new MatTableDataSource(this.menus);
            });
          }

          const stsmg = this.dg.open(MessageComponent, {
            width: '500px',
            data: {
              heading: 'Status -Submenu Delete',
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
   * @description getting erros in form controls
   * @returns form control errors
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
   * @description get errors in submenu form controls
   * @returns errors in submenu form controls
   */
  getSubMenuErrors() {
    let errors: string = '';

    for (const controlName in this.subMenuForm.controls) {
      const control = this.subMenuForm.controls[controlName];

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
   * @description get form control updates
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
   * @description get submenu form control updates
   * @returns submenu form control updates
   */
  getSubMenuUpdates() {
    let updates = '';
    for (const controlName in this.subMenuForm.controls) {
      const control = this.subMenuForm.controls[controlName];
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
   * @description create submenu form and add validators
   */
  createSubMenuForm() {
    this.subMenuForm.controls['name'].setValidators([
      Validators.required,
      // Validators.pattern(this.regexes['name']['regex']),
    ]);
    this.subMenuForm.controls['ingredients'].setValidators([
      Validators.required,
    ]);

    Object.values(this.subMenuForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  /**
   * @description create menu form and add validators
   */
  createForm() {
    this.form.controls['name'].setValidators([
      Validators.required,
      Validators.pattern(this.menuRegexes['name']['regex']),
    ]);
    this.form.controls['price'].setValidators([
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?$/),
    ]);

    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
    });

    this.enableButtons(true, false, false);
  }
}
