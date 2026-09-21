import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface VisitorRecord {
  id: number;
  name: string;
  email: string;
  mobile: string;
  visitorType: string;
  company: string;
  status: string;
  visitDate: string;
}


@Component({
  selector: 'app-visitor-list',
  imports: [FormsModule],
  templateUrl: './visitor-list.html',
  styleUrl: './visitor-list.css'
})
export class VisitorListComponent {

 visitorRecords: VisitorRecord[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    mobile: '9876543210',
    visitorType: 'VISITOR',
    company: 'ABC Technologies',
    status: 'CHECKED_IN',
    visitDate: '2026-09-21'
  },
  {
    id: 2,
    name: 'Priya Kumar',
    email: 'priya@example.com',
    mobile: '9876501234',
    visitorType: 'GUEST',
    company: 'XYZ Solutions',
    status: 'CHECKED_OUT',
    visitDate: '2026-09-20'
  },
  {
    id: 3,
    name: 'Arun Raj',
    email: 'arun@example.com',
    mobile: '9123456789',
    visitorType: 'VENDOR',
    company: 'Global Supplies',
    status: 'REGISTERED',
    visitDate: '2026-09-20'
  },
  {
    id: 4,
    name: 'Meena Joseph',
    email: 'meena@example.com',
    mobile: '9988776655',
    visitorType: 'VISITOR',
    company: 'ABC Technologies',
    status: 'CANCELLED',
    visitDate: '2026-09-18'
  },
  {
    id: 5,
    name: 'Karthik Kumar',
    email: 'karthik@example.com',
    mobile: '9001122334',
    visitorType: 'GUEST',
    company: '—',
    status: 'NO_SHOW',
    visitDate: '2026-09-17'
  }
];

  searchText = '';
  selectedVisitorType = '';
  selectedStatus = '';
  selectedDate = '';

  get filteredVisitors(): VisitorRecord[] {

  return this.visitorRecords.filter(visitor => {

    const search = this.searchText.toLowerCase().trim();

    const matchesSearch =
      !search ||
      visitor.name.toLowerCase().includes(search) ||
      visitor.email.toLowerCase().includes(search) ||
      visitor.mobile.includes(search) ||
      visitor.id.toString().includes(search);

    const matchesVisitorType =
      !this.selectedVisitorType ||
      visitor.visitorType === this.selectedVisitorType;

    const matchesStatus =
      !this.selectedStatus ||
      visitor.status === this.selectedStatus;

    const matchesDate =
      !this.selectedDate ||
      visitor.visitDate === this.selectedDate;

    return (
      matchesSearch &&
      matchesVisitorType &&
      matchesStatus && 
      matchesDate
    );

  });

}

  getStatusLabel(status: string): string {

  switch (status) {

    case 'CHECKED_IN':
      return 'Checked In';

    case 'CHECKED_OUT':
      return 'Checked Out';

    case 'NO_SHOW':
      return 'No Show';

    case 'CANCELLED':
      return 'Cancelled';

    case 'REGISTERED':
      return 'Registered';

    default:
      return status;
  }

}

  clearFilters(): void {

  this.searchText = '';
  this.selectedVisitorType = '';
  this.selectedStatus = '';
  this.selectedDate = '';

}

}

