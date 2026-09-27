export type Nationality =
  | 'DOMESTIC'
  | 'INTERNATIONAL';

export type BlacklistStatus =
  | 'ACTIVE'
  | 'REMOVED';

export type VisitorType =
  | 'VISITOR'
  | 'GUEST'
  | 'VENDOR';

export interface BlacklistResponse {
  id: string;
  visitorId: string;
  visitorName: string;

  email: string;
  mobileNumber: string;
  companyName: string | null;

  nationality: Nationality;
  reason: string;
  status: BlacklistStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string | null;
  updatedBy: string | null;

  visitorType: VisitorType | null;
}