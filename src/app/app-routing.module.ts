import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './view/login/login.component';
import { MainwindowComponent } from './view/mainwindow/mainwindow.component';
import { EmployeeComponent } from './view/modules/employee/employee.component';
import { HomeComponent } from './view/home/home.component';
import { UserComponent } from './view/modules/user/user.component';
import { EventComponent } from './view/modules/event/event.component';
import { HallComponent } from './view/modules/hall/hall.component';
import { ItemComponent } from './view/modules/item/item.component';
import { SupplierComponent } from './view/modules/supplier/supplier.component';
import { CustomerComponent } from './view/modules/customer/customer.component';
import { PaymentComponent } from './view/modules/payment/payment.component';
import { MenuComponent } from './view/modules/menu/menu.component';
import { ExpenseComponent } from './view/modules/expense/expense.component';
import { SalaryComponent } from './view/modules/salary/salary.component';
import { CountbydesignationComponent } from './view/countbydesignation/countbydesignation.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'main',
    component: MainwindowComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'employee', component: EmployeeComponent },
      { path: 'user', component: UserComponent },
      { path: 'event', component: EventComponent },
      { path: 'hall', component: HallComponent },
      { path: 'item', component: ItemComponent },
      { path: 'supplier', component: SupplierComponent },
      { path: 'customer', component: CustomerComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'expense', component: ExpenseComponent },
      { path: 'salary', component: SalaryComponent },
      {
        path: 'report-countbydesignation',
        component: CountbydesignationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
