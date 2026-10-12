export interface VisitorLogResponse {

  visitId: string;
  visitReference: string;

  visitorId: string;
  visitorName: string;

  visitorType: string;
  companyName: string | null;

  hostName: string;

  visitDate: string;

  expectedArrivalAt: string;
  expectedDepartureAt: string | null;

  checkedInAt: string | null;
  checkedOutAt: string | null;

  status: string;
}


export interface VisitorLogPage {
  content: VisitorLogResponse[];

  totalElements: number;
  totalPages: number;

  size: number;
  number: number;

  first: boolean;
  last: boolean;
}