export interface VisitorBase {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string | null;
  visitorType: string | null;
}

export interface VisitorResponse extends VisitorBase {
  lastVisitDate: string | null;
}

export interface VisitorEditVisitor extends VisitorBase {
  nationality: string | null;
}


export interface VisitorVendor {
  vendorId: string;
}

export interface VisitorDocument {
  documentId: string;
  documentPath: string;
  createdAt: string | null;
}

export interface VisitorVisit {
  visitId: string;
  visitReference: string | null;
  visitorType: string | null;
  registrationType: string | null;
  purpose: string | null;
  hostId: string | null;
  hostName: string | null;
  departmentId: string | null;
  departmentName: string | null;
  expectedArrivalAt: string | null;
  expectedDepartureAt: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  totalDurationSeconds: number | null;
  remarks: string | null;
  status: string;
}

export interface VisitorBlacklist {
  id: string;
  reason: string | null;
  status: string;
  createdAt: string | null;
}

export interface UpdateVisitorRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  companyName: string | null;
}

export interface VisitorEditResponse {
  visitor: VisitorEditVisitor;
  vendor: VisitorVendor | null;
  documents: VisitorDocument[];
  visits: VisitorVisit[];
  blacklist: VisitorBlacklist | null;
  blacklisted: boolean;
}
