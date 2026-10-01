export type VisitorType =
  | 'GUEST'
  | 'VISITOR'
  | 'VENDOR';

export type RegistrationType =
  | 'PRE_REGISTRATION'
  | 'ARRIVAL_REGISTRATION';

export type ProofType =
  | 'AADHAAR'
  | 'PASSPORT'
  | 'PAN';

export type Nationality =
  | 'DOMESTIC'
  | 'INTERNATIONAL';


export interface RegistrationRequest {
  registrationType: RegistrationType;
  visitorType: VisitorType;

  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string;

  purpose: string;
  hostId: string;

  visitDate: string;
  expectedArrivalTime: string;
  expectedDepartureTime: string;

  remarks: string | null;
nationality: Nationality;
 aadharNumber: string | null;
  panNumber: string | null;
  passportNumber: string | null;
   validity: string | null;
}


export interface RegistrationResponse {
  visitId: string;
  visitReference: string;

  visitorId: string;

  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string;

  visitorType: VisitorType;
  registrationType: RegistrationType;

  purpose: string;

  hostId: string;
  departmentId: string | null;

  expectedArrivalAt: string;
  expectedDepartureAt: string;

  remarks: string | null;

  status: string;

  message: string;
}