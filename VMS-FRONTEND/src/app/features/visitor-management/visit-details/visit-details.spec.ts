import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VisitDetailsComponent } from './visit-details';
import { VisitService } from '../../../core/services/visit/visit.service';
import { BlacklistService } from '../../../core/services/blacklist/blacklist.service';
import { VisitDetailResponse } from '../../../core/models/visit/visit-detail.model';

describe('VisitDetailsComponent', () => {
  let component: VisitDetailsComponent;
  let fixture: ComponentFixture<VisitDetailsComponent>;

  const visitServiceMock = {
    getVisitDetails: vi.fn(),
    getVisitorPhoto: vi.fn(),
  };

  const blacklistServiceMock = {
    getAllBlacklistRecords: vi.fn(),
    addExistingVisitorToBlacklist: vi.fn(),
  };

  const mockVisitDetails: VisitDetailResponse = {
    visitId: 'visit-123',
    visitReference: 'VIS-123',
    visitor: {
      visitorId: 'visitor-123',
      firstName: 'Logesh',
      lastName: 'Kumar',
      email: 'visitor@example.com',
      mobileNumber: '9876543210',
      companyName: 'Example Company',
      nationality: 'DOMESTIC',
      ndaAvailable: false,
      ndaDocumentId: null,
      ndaValidUntil: null,
    },
    visitorType: 'GUEST',
    registrationType: 'PRE_REGISTRATION',
    purpose: 'Business meeting',
    host: {
      hostId: 'host-123',
      hostName: 'Test Host',
      departmentId: 'dept-123',
      departmentName: 'Administration',
    },
    expectedArrivalAt: '2026-10-04T10:00:00',
    expectedDepartureAt: '2026-10-04T11:00:00',
    checkedInAt: null,
    checkedOutAt: null,
    remarks: null,
    status: 'REGISTERED',
    audit: {
      createdAt: '2026-10-03T10:00:00',
      updatedAt: '2026-10-03T10:00:00',
      createdBy: null,
      updatedBy: null,
    },
  };

  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(async () => {
    visitServiceMock.getVisitDetails.mockReturnValue(of(mockVisitDetails));
    visitServiceMock.getVisitorPhoto.mockReturnValue(
      of(new Blob(['test-photo'], { type: 'image/jpeg' })),
    );
    blacklistServiceMock.getAllBlacklistRecords.mockReturnValue(of([]));

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:test-visitor-photo'),
    });

    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(),
    });

    await TestBed.configureTestingModule({
      imports: [VisitDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn().mockReturnValue('visit-123'),
              },
            },
          },
        },
        { provide: VisitService, useValue: visitServiceMock },
        { provide: BlacklistService, useValue: blacklistServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitDetailsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: originalCreateObjectURL,
    });

    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: originalRevokeObjectURL,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load visit details successfully', () => {
    fixture.detectChanges();

    expect(visitServiceMock.getVisitDetails).toHaveBeenCalledWith('visit-123');
    expect(component.visitDetails).toEqual(mockVisitDetails);
  });

  it('should load the saved visitor photo successfully', () => {
    fixture.detectChanges();

    expect(visitServiceMock.getVisitorPhoto).toHaveBeenCalledWith('visitor-123');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(component.visitorPhotoUrl).toBe('blob:test-visitor-photo');
    expect(component.isVisitorPhotoLoading).toBe(false);
  });

  it('should handle visitor photo loading failure', () => {
    visitServiceMock.getVisitorPhoto.mockReturnValue(
      throwError(() => new Error('Photo not found')),
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fixture.detectChanges();

    expect(component.visitorPhotoUrl).toBeNull();
    expect(component.isVisitorPhotoLoading).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should handle visit details loading failure', () => {
    visitServiceMock.getVisitDetails.mockReturnValue(
      throwError(() => new Error('Visit not found')),
    );

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fixture.detectChanges();

    expect(component.visitDetails).toBeNull();
    expect(visitServiceMock.getVisitorPhoto).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});