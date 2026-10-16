import { Routes } from '@angular/router';

// Authentication pages
import { LoginComponent } from './features/auth/login/login';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password';
import { UserRegistrationComponent } from './features/user-management/user-registration/user-registration';

// Route protection
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { QrScannerComponent } from './features/qr-scanner/qr-scanner';
// Visitor management
import { VisitorRegistrationComponent } from './features/visitor-management/visitor-registration/visitor-registration';
import { VisitorEditComponent } from './features/visitor-management/visitor-edit/visitor-edit';
import { VisitorListComponent } from './features/visitor-management/visitor-list/visitor-list';
import { VisitDetailsComponent } from './features/visitor-management/visit-details/visit-details';

// Vendor management
import { VendorEditComponent } from './features/vendor-management/vendor-edit/vendor-edit';
import { VendorListComponent } from './features/vendor-management/vendor-list/vendor-list';

// Visit management
import { VisitListComponent } from './features/visit-management/visit-list/visit-list';

// Employee management
import { EmployeeListComponent } from './features/employee/employee-management/employee-list/employee-list';
import { EmployeeAddComponent } from './features/employee/employee-add/employee-add';

// Department management
import { DepartmentListComponent } from './features/department/department-management/department-list/department-list';
import { DepartmentAddComponent } from './features/department/department-add/department-add';

// Blacklist management
import { Blacklist } from './features/blacklist/blacklist';
import { BlacklistDetails } from './features/blacklist-details/blacklist-details';

// Admin layout
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';

// Visitor log
import { VisitorLogComponent } from './features/visitor-log/visitor-log';

export const routes: Routes = [
  // Redirect the root URL to the login page.
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // Public login page.
  {
    path: 'login',
    component: LoginComponent,
  },

  // Public password recovery pages.
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },


  // Protected admin area.
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      // Visitor registration.
      {
        path: 'pre-registration',
        component: VisitorRegistrationComponent,
      },

      {
        path: 'user-registration',
        component: UserRegistrationComponent,
        canActivate: [adminGuard],
      },

      // Visit list and individual visit details.
      {
        path: 'visits',
        component: VisitListComponent,
      },
      {
        path: 'visits/:visitId',
        component: VisitDetailsComponent,
      },

      // Visitor list and editing.
      {
        path: 'visitors',
        component: VisitorListComponent,
      },
      {
        path: 'visitors/:visitorId/edit',
        component: VisitorEditComponent,
      },

      // Vendor list and editing.
      {
        path: 'vendors',
        component: VendorListComponent,
      },
      {
        path: 'vendors/:vendorId/edit',
        component: VendorEditComponent,
      },

      // Employee management.
      {
        path: 'employees',
        component: EmployeeListComponent,
      },
      {
        path: 'employees/add',
        component: EmployeeAddComponent,
      },

      // Department management.
      {
        path: 'departments',
        component: DepartmentListComponent,
      },
      {
        path: 'departments/add',
        component: DepartmentAddComponent,
      },

      // Blacklist management.
      {
        path: 'blacklist',
        component: Blacklist,
      },
      {
        path: 'blacklist/:id',
        component: BlacklistDetails,
      },

      // Visitor log.
      {
        path: 'visitor-log',
        component: VisitorLogComponent,
      },

       {
    path: 'qr-scanner',
    component: QrScannerComponent
  }
    ],
  },

  // Redirect unknown URLs to login.
  {
    path: '**',
    redirectTo: 'login',
  },
];
