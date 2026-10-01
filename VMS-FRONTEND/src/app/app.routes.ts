
import { Routes } from '@angular/router';

import { VisitorRegistrationComponent }
  from './features/visitor-management/visitor-registration/visitor-registration';

import { VisitorEditComponent }
  from './features/visitor-management/visitor-edit/visitor-edit';
import { AdminLayoutComponent }
  from './layout/admin-layout/admin-layout';

import { VisitListComponent }
  from './features/visit-management/visit-list/visit-list';

import { EmployeeListComponent }
  from './features/employee/employee-management/employee-list/employee-list';

import { DepartmentListComponent }
  from './features/department/department-management/department-list/department-list';

import { Blacklist } from './features/blacklist/blacklist';

import { BlacklistDetails } from './features/blacklist-details/blacklist-details';
import { VisitorListComponent }  from './features/visitor-management/visitor-list/visitor-list';

import { VendorListComponent } from './features/vendor-management/vendor-list/vendor-list';

import { VisitDetailsComponent }
  from './features/visitor-management/visit-details/visit-details';

import { DepartmentAddComponent }
  from './features/department/department-add/department-add';

import { EmployeeAddComponent }
  from './features/employee/employee-add/employee-add';

export const routes: Routes = [

  // LANDING PAGE
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then(
        m => m.Landing
      )
  },

  // ADMIN
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [

      // Pre-Registration
      {
        path: 'pre-registration',
        component: VisitorRegistrationComponent
      },

      // Visits
      {
        path: 'visits',
        component: VisitListComponent
      },

      {
        path: 'visits/:visitId',
        component: VisitDetailsComponent
      },

      // Visitors
      {
        path: 'visitors',
        component: VisitorListComponent
      },
      {
  path: 'visitors/:visitorId/edit',
  component: VisitorEditComponent
},
      {
  path: 'vendors',
  component: VendorListComponent
},

      // Employees
      {
  path: 'employees',
  component: EmployeeListComponent
},
{
  path: 'employees/add',
  component: EmployeeAddComponent
},

      // Departments
      {
  path: 'departments',
  component: DepartmentListComponent
},
{
  path: 'departments/add',
  component: DepartmentAddComponent
},

      // Blacklist
      {
        path: 'blacklist',
        component: Blacklist
      },

      // Blacklist Details
      {
        path: 'blacklist/:id',
        component: BlacklistDetails
      }

    ]
  },

  // UNKNOWN ROUTES
  {
    path: '**',
    redirectTo: 'admin/pre-registration'
  }

];