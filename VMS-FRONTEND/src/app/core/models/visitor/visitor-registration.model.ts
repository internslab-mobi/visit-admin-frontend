export interface VisitorRegistrationForm {
  visitorTypeId: number;

  registrationTypeId: number;

  fullName: string;

  email: string;

  phoneNumber: string;

  company?: string;

  purposeId: number;

  hostEmployeeId: number;

  departmentId: number;

  visitDate: string;

  visitTime: string;

  //remarks?: string;

  idTypeId: number;

  idNumber: string;

  idProof?: File;
}