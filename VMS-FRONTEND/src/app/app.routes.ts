import { Routes } from '@angular/router';

import { VisitorRegistrationComponent }
  from './features/visitor-management/visitor-registration/visitor-registration';

import { AdminLayoutComponent }
  from './layout/admin-layout/admin-layout';

import { VisitListComponent } from './features/visit-management/visit-list/visit-list';

import { EmployeeListComponent }
  from './features/employee-management/employee-list/employee-list';

import { DepartmentListComponent }
  from './features/department-management/department-list/department-list';

import { VisitorListComponent }
  from './features/visitor-management/visitor-list/visitor-list';

export const routes: Routes = [

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
    {
    path: 'pre-registration',
    component: VisitorRegistrationComponent
    },
    {
      path: 'visits',
      component: VisitListComponent
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

    
  // UNKNOWN ROUTES
    

  {
    path: '**',
    redirectTo: 'admin/pre-registration'
  }

];