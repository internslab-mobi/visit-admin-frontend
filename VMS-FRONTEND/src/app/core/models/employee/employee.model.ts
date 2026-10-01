export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  department: {
    id: string;
    departmentName: string;
  };
  designation: string;
  status: string;
}

export interface EmployeeCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  departmentId: string;
  designation: string;
}