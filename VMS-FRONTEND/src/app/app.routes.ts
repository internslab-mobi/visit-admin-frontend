import { Routes } from '@angular/router';

import { VisitorRegistrationComponent }
  from './features/visitor-registration/visitor-registration';

import { AdminLayoutComponent }
  from './layout/admin-layout/admin-layout';

import { VisitorListComponent } from './features/visitor-management/visitor-list/visitor-list';

export const routes: Routes = [

  // ======================
  // VISITOR MANAGEMENT
  // ======================

  {
    path: 'visitor-registration',
    component: VisitorRegistrationComponent
  },

   // ======================
  // ADMIN
  // ======================

  {
  path: 'admin',
  component: AdminLayoutComponent,
  children: [
    {
      path: 'visitors',
      component: VisitorListComponent
    }
  ]
},

  // ======================
  // UNKNOWN ROUTES
  // ======================

  {
    path: '**',
    redirectTo: 'visitor-registration'
  }

];