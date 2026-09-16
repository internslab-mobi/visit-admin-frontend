// import { VisitStatus } from "./visit-status";

// export interface Visit {
//   id: number;

//   visitorId: number;

//   visitorTypeId: number;

//   registrationTypeId: number;

//   purposeId: number;

//   hostEmployeeId: number;

//   departmentId: number;

//   visitDate: string;

//   visitTime: string;

//   remarks?: string;

//   status: VisitStatus;

//   qrCode?: string;

//   checkInTime?: string;

//   checkOutTime?: string;

//   createdAt?: string;

//   updatedAt?: string;
// }

import { VisitStatus } from './visit-status';

export interface Visit {
  id: number;

  visitReference: string;

  visitorId: number;

  visitorType: string;
  registrationType: string;

  purpose: string;

  hostId: number;
  departmentId?: number | null;

  expectedArrivalAt: string;
  expectedDepartureAt?: string | null;

  remarks?: string | null;

  // ID proof is optional
  proofType?: string | null;
  proofNumber?: string | null;
  proofImagePath?: string | null;

  status: VisitStatus;
}