export interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
  status: string;
}

export interface DepartmentCreateRequest {
  departmentCode: string;
  departmentName: string;
}