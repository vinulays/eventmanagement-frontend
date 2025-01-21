import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './view/home/home.component';
import { LoginComponent } from './view/login/login.component';
import { MainwindowComponent } from './view/mainwindow/mainwindow.component';
import { EmployeeComponent } from './view/modules/employee/employee.component';
import { UserComponent } from './view/modules/user/user.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MessageComponent } from './util/dialog/message/message.component';
import { MatDialogModule } from '@angular/material/dialog';
import { EventComponent } from './view/modules/event/event.component';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { EventService } from './service/event.service';
import { EmployeeService } from './service/employee.service';
import { MatSelectModule } from '@angular/material/select';
import { PackageService } from './service/package.service';
import { EventTypeService } from './service/eventType.service';
import { HallService } from './service/hall.service';
import { ConfirmComponent } from './util/dialog/confirm/confirm.component';
import { DesignationService } from './service/designation.service';
import { GenderService } from './service/gender.service';
import { RegexService } from './service/regex.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EventStatusService } from './service/eventStatus.service';
import { EmployeeStatusService } from './service/employeeStatus.service';
import { CustomerService } from './service/customer.service';
import { DatePipe } from '@angular/common';
import { HallComponent } from './view/modules/hall/hall.component';
import { ItemComponent } from './view/modules/item/item.component';
import { SupplierComponent } from './view/modules/supplier/supplier.component';
import { SupplierService } from './service/supplier.service';
import { ItemService } from './service/item.service';
import { CustomerComponent } from './view/modules/customer/customer.component';
import { PaymentComponent } from './view/modules/payment/payment.component';
import { PaymentService } from './service/payment.service';
import { PaymentStatusService } from './service/payment-status.service';
import { MenuComponent } from './view/modules/menu/menu.component';
import { MenuService } from './service/menu.service';
import { ExpenseComponent } from './view/modules/expense/expense.component';
import { ExpenseService } from './service/expense.service';
import { ExpenseTypeService } from './service/expense-type.service';
import { SalaryService } from './service/salary.service';
import { SalaryComponent } from './view/modules/salary/salary.component';
import { SubmenuService } from './service/submenu.service';
import { CountbydesignationComponent } from './view/countbydesignation/countbydesignation.component';
import { ReportService } from './service/report.service';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    MainwindowComponent,
    EmployeeComponent,
    UserComponent,
    MessageComponent,
    EventComponent,
    ConfirmComponent,
    HallComponent,
    ItemComponent,
    SupplierComponent,
    CustomerComponent,
    PaymentComponent,
    MenuComponent,
    ExpenseComponent,
    SalaryComponent,
    CountbydesignationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    HttpClientModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
  ],
  providers: [
    EventService,
    EmployeeService,
    PackageService,
    EventTypeService,
    HallService,
    GenderService,
    DesignationService,
    RegexService,
    EventStatusService,
    EmployeeStatusService,
    CustomerService,
    DatePipe,
    SupplierService,
    ItemService,
    PaymentService,
    PaymentStatusService,
    MenuService,
    ExpenseService,
    ExpenseTypeService,
    SalaryService,
    SubmenuService,
    ReportService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
