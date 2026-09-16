export interface Visitor {
  id: number;

  firstName: string;
  lastName: string;

  email: string;
  mobileNumber: string;

  companyName: string;

  cooldownUntil?: string | null;
}