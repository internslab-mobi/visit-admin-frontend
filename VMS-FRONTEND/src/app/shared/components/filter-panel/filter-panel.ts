
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css'
})
export class FilterPanelComponent {

  @Input() idPrefix = 'directory';

  @Input() title = '';
  @Input() description = '';

  @Input() searchLabel = 'Search';
  @Input() searchPlaceholder = 'Search records';

  @Input() showVisitorTypeFilter = false;

  @Input() showDateFilters = true;

  @Input() visitorTypeOptions: FilterOption[] = [
    { label: 'Visitor', value: 'VISITOR' },
    { label: 'Guest', value: 'GUEST' },
    { label: 'Vendor', value: 'VENDOR' }
  ];

  @Input() fromDateLabel = 'From Date';
  @Input() toDateLabel = 'To Date';

  @Input() sortOptions: FilterOption[] = [];

  @Input() orderOptions: FilterOption[] = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' }
  ];

  @Input() searchText = '';
  @Input() selectedVisitorType = '';
  @Input() fromDate = '';
  @Input() toDate = '';
  @Input() sortBy = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  @Output() searchTextChange = new EventEmitter<string>();
  @Output() selectedVisitorTypeChange =
    new EventEmitter<string>();
  @Output() fromDateChange = new EventEmitter<string>();
  @Output() toDateChange = new EventEmitter<string>();
  @Output() sortByChange = new EventEmitter<string>();
  @Output() sortDirectionChange =
    new EventEmitter<'asc' | 'desc'>();

  @Output() filterChange = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  onSearchChange(value: string): void {
    this.searchTextChange.emit(value);
    this.filterChange.emit();
  }

  onVisitorTypeChange(value: string): void {
    this.selectedVisitorTypeChange.emit(value);
    this.filterChange.emit();
  }

  onFromDateChange(value: string): void {
    this.fromDateChange.emit(value);
    this.filterChange.emit();
  }

  onToDateChange(value: string): void {
    this.toDateChange.emit(value);
    this.filterChange.emit();
  }

  onSortByChange(value: string): void {
    this.sortByChange.emit(value);
    this.sortChange.emit();
  }

  onSortDirectionChange(value: 'asc' | 'desc'): void {
    this.sortDirectionChange.emit(value);
    this.sortChange.emit();
  }
}
