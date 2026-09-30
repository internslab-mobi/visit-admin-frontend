export interface VisitDetailResponse {

  visitId: string;

  visitReference: string;

  visitor: VisitorDetails;

  visitorType: string;

  registrationType: string;

  purpose: string;

  host: HostDetails;

  expectedArrivalAt: string;

  expectedDepartureAt: string;

  checkedInAt: string | null;

  checkedOutAt: string | null;

  remarks: string | null;

  status: string;

  audit: AuditDetails;
}


export interface VisitorDetails {

  visitorId: string;

  firstName: string;

  lastName: string;

  email: string;

  mobileNumber: string;

  companyName: string;

  ndaAvailable: boolean;

  ndaDocumentId: string | null;

  ndaValidUntil: string | null;
}


export interface HostDetails {

  hostId: string;

  hostName: string;

  departmentId: string;

  departmentName: string;
}


export interface AuditDetails {

  createdAt: string;

  updatedAt: string;

  createdBy: string | null;

  updatedBy: string | null;
}