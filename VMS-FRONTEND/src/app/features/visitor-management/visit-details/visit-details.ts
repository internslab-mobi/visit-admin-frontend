import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { VisitService } from '../../../core/services/visit/visit.service';
import { VisitDetailResponse } from '../../../core/models/visit/visit-detail.model';

@Component({
  selector: 'app-visit-details',
  imports: [RouterLink],
  templateUrl: './visit-details.html',
  styleUrl: './visit-details.css'
})
export class VisitDetailsComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly visitService = inject(VisitService);

  visitDetails: VisitDetailResponse | null = null;

  ngOnInit(): void {

    const visitId =
      this.route.snapshot.paramMap.get('visitId');

    if (!visitId) {
      console.error('Visit ID not found in route');
      return;
    }

    console.log('Loading visit details for:', visitId);

    this.visitService.getVisitDetails(visitId)
      .subscribe({
        next: (response) => {
          console.log('VISIT DETAILS API RESPONSE:', response);

          this.visitDetails = response;
        },
        error: (error) => {
          console.error(
            'Failed to load visit details:',
            error
          );
        }
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
}