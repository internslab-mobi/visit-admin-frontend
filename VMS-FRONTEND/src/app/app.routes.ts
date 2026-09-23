import { Routes } from '@angular/router';

import { VisitorRegistrationComponent }
  from './features/visitor-registration/visitor-registration';

import { AdminLayoutComponent }
  from './layout/admin-layout/admin-layout';

import { VisitorListComponent } from './features/visitor-management/visitor-list/visitor-list';

import { EmployeeListComponent }
  from './features/employee-management/employee-list/employee-list';

import { DepartmentListComponent }
  from './features/department-management/department-list/department-list';

export const routes: Routes = [


   // ======================
  // ADMIN
  // ======================

  {
  path: 'admin',
  component: AdminLayoutComponent,
  children: [
    {
    path: 'pre-registration',
    component: VisitorRegistrationComponent
    },
    {
      path: 'visitors',
      component: VisitorListComponent
    },
    {
      path: 'employees',
      component: EmployeeListComponent
    },
    {
      path: 'departments',
      component: DepartmentListComponent
    }
  ]
},

  // ======================
  // UNKNOWN ROUTES
  // ======================

  {
    path: '**',
    redirectTo: 'admin/pre-registration'
  }

];