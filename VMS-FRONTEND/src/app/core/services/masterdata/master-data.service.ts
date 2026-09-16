import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { VisitorType } from '../../models/visitor/visitor-type.model';
import { RegistrationType } from '../../models/visitor/registration-type.model';
import { IdType } from '../../models/visitor/id-type.model';
@Injectable({
  providedIn: 'root'
})
export class MasterDataService {

  /*
   * Temporary mock data.
   * Later these values will come from the backend/database.
   */

  private visitorTypes: VisitorType[] = [
    {
      id: 1,
      name: 'Visitor',
      description: 'General business or professional visitor',
      isActive: true
    },
    {
      id: 2,
      name: 'Guest',
      description: 'Personal or invited guest',
      isActive: true
    },
    {
      id: 3,
      name: 'Vendor',
      description: 'Vendor or service provider',
      isActive: true
    }
  ];

  private registrationTypes: RegistrationType[] = [
    {
      id: 1,
      name: 'Pre-Registration',
      description: 'Visitor is registered before arriving at the office',
      isActive: true
    },
    {
      id: 2,
      name: 'Arrival Registration',
      description: 'Visitor is registered when they arrive at the office',
      isActive: true
    }
  ];

  private purposes = [
    {
      id: 1,
      name: 'Business Meeting',
      isActive: true
    },
    {
      id: 2,
      name: 'Interview',
      isActive: true
    },
    {
      id: 3,
      name: 'Delivery',
      isActive: true
    },
    {
      id: 4,
      name: 'Service / Maintenance',
      isActive: true
    },
    {
      id: 5,
      name: 'Audit / Inspection',
      isActive: true
    },
    {
      id: 6,
      name: 'Personal Visit',
      isActive: true
    },
    {
      id: 7,
      name: 'Other',
      isActive: true
    }
  ];

  private idTypes: IdType[] = [
    {
      id: 1,
      name: 'Aadhaar Card',
      description: 'Indian Aadhaar identification',
      isActive: true
    },
    {
      id: 2,
      name: 'PAN Card',
      description: 'Permanent Account Number card',
      isActive: true
    },
    {
      id: 3,
      name: 'Passport',
      description: 'Passport identification',
      isActive: true
    },
    {
      id: 4,
      name: 'Driving License',
      description: 'Driving license identification',
      isActive: true
    },
    {
      id: 5,
      name: 'Voter ID',
      description: 'Voter identification card',
      isActive: true
    }
  ];

  /**
   * Get active visitor types.
   */
  getVisitorTypes(): Observable<VisitorType[]> {
    return of(
      this.visitorTypes.filter(type => type.isActive)
    );
  }

  /**
   * Get active registration types.
   */
  getRegistrationTypes(): Observable<RegistrationType[]> {
    return of(
      this.registrationTypes.filter(type => type.isActive)
    );
  }

  /**
   * Get active visit purposes.
   */
  getPurposes(): Observable<{ id: number; name: string; isActive: boolean }[]> {
    return of(
      this.purposes.filter(purpose => purpose.isActive)
    );
  }

  /**
   * Get active ID types.
   */
  getIdTypes(): Observable<IdType[]> {
    return of(
      this.idTypes.filter(type => type.isActive)
    );
  }
}