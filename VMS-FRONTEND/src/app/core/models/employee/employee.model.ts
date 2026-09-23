export interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  //description: string | null;
  status: string;
}

export interface Employee {
  id: string;
  
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  department: Department;
  designation: string;
  status: string;
}