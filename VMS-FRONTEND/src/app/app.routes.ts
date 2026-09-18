import { Routes } from '@angular/router';

import { VisitorRegistrationComponent }
  from './features/visitor-registration/visitor-registration';

export const routes: Routes = [

  // ======================
  // VISITOR MANAGEMENT
  // ======================

  {
    path: 'visitor-registration',
    component: VisitorRegistrationComponent
  },


  // ======================
  // UNKNOWN ROUTES
  // ======================

  {
    path: '**',
    redirectTo: 'visitor-registration'
  }

];