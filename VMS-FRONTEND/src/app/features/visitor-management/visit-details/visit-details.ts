import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { VisitService } from '../../../core/services/visit/visit.service';
import { VisitDetailResponse } from '../../../core/models/visit/visit-detail.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visit-details',
  imports: [RouterLink, FormsModule],
  templateUrl: './visit-details.html',
  styleUrl: './visit-details.css'
})
export class VisitDetailsComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly visitService = inject(VisitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  visitDetails: VisitDetailResponse | null = null;

  aadharNumber = '';
  panNumber = '';
  passportNumber = '';

  selectedPhoto: File | null = null;

  isCheckingIn = false;

  get nationality(): string | null {
    return this.visitDetails?.visitor.nationality ?? null;
  }

  ngOnInit(): void {

    const visitId =
      this.route.snapshot.paramMap.get('visitId');

    if (!visitId) {
      console.error('Visit ID not found in route');
      return;
    }

    this.visitService.getVisitDetails(visitId)
      .subscribe({
        next: (response) => {

          this.visitDetails = response;

          this.changeDetectorRef.markForCheck();

        },
        error: (error) => {
          console.error(
            'Failed to load visit details:',
            error
          );
        }
      });
  }

  onPhotoSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedPhoto = null;
      return;
    }

    this.selectedPhoto = input.files[0];

    console.log(
      'Selected visitor photo:',
      this.selectedPhoto.name
    );
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
}