import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';

import { authGuard } from './core/guards/auth.guard';

import { VisitorRegistrationComponent } from './features/visitor-management/visitor-registration/visitor-registration';

import { VisitorEditComponent } from './features/visitor-management/visitor-edit/visitor-edit';
import { VendorEditComponent }  from './features/vendor-management/vendor-edit/vendor-edit';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';

import { VisitListComponent } from './features/visit-management/visit-list/visit-list';

import { EmployeeListComponent } from './features/employee/employee-management/employee-list/employee-list';

import { DepartmentListComponent } from './features/department/department-management/department-list/department-list';

import { Blacklist } from './features/blacklist/blacklist';

import { BlacklistDetails } from './features/blacklist-details/blacklist-details';

import { VisitorListComponent } from './features/visitor-management/visitor-list/visitor-list';

import { VendorListComponent } from './features/vendor-management/vendor-list/vendor-list';

import { VisitDetailsComponent } from './features/visitor-management/visit-details/visit-details';

import { DepartmentAddComponent } from './features/department/department-add/department-add';

import { EmployeeAddComponent } from './features/employee/employee-add/employee-add';

import { VisitorLogComponent } from './features/visitor-log/visitor-log';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'pre-registration',
        component: VisitorRegistrationComponent,
      },
      {
        path: 'visits',
        component: VisitListComponent,
      },
      {
        path: 'visits/:visitId',
        component: VisitDetailsComponent,
      },
      {
        path: 'visitors',
        component: VisitorListComponent,
      },
      {
        path: 'visitors/:visitorId/edit',
        component: VisitorEditComponent,
      },
      {
        path: 'vendors',
        component: VendorListComponent,
      },
      {
  path: 'vendors/:vendorId/edit',
  component: VendorEditComponent
},
      {
        path: 'employees',
        component: EmployeeListComponent,
      },
      {
        path: 'employees/add',
        component: EmployeeAddComponent,
      },
      {
        path: 'departments',
        component: DepartmentListComponent,
      },
      {
        path: 'departments/add',
        component: DepartmentAddComponent,
      },
      {
        path: 'blacklist',
        component: Blacklist,
      },
      {
        path: 'blacklist/:id',
        component: BlacklistDetails,
      },
      {
  path: 'visitor-log',
  component: VisitorLogComponent,
},
      
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
