import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { VisitService } from '../../../core/services/visit/visit.service';
import { VisitDetailResponse } from '../../../core/models/visit/visit-detail.model';

import { BlacklistService } from '../../../core/services/blacklist/blacklist.service';
import {
  AddVisitorToBlacklistRequest,
  BlacklistResponse,
} from '../../../core/models/blacklist/blacklist.model';

@Component({
  selector: 'app-visit-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './visit-details.html',
  styleUrl: './visit-details.css',
})
export class VisitDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly visitService = inject(VisitService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly blacklistService = inject(BlacklistService);

  @ViewChild('videoElement')
  cameraVideo?: ElementRef<HTMLVideoElement>;

  @ViewChild('photoInput')
  photoInput?: ElementRef<HTMLInputElement>;

  private visitId: string | null = null;

  visitDetails: VisitDetailResponse | null = null;
  visitorPhotoUrl: string | null = null;
  isVisitorPhotoLoading = false;

  aadharNumber = '';
  panNumber = '';
  passportNumber = '';

  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  photoError: string | null = null;

  isCameraOpen = false;
  isCapturingPhoto = false;

  private cameraStream: MediaStream | null = null;

  isVerifyingIdentity = false;
  identityVerified = false;
  identityVerificationError: string | null = null;
  identityVerificationSuccess: string | null = null;

  isCheckingIn = false;
  checkInError: string | null = null;
  checkInSuccess: string | null = null;

  isCheckingOut = false;
  checkOutError: string | null = null;
  checkOutSuccess: string | null = null;

  showBlacklistForm = false;
  isAddingToBlacklist = false;

  blacklistReason = '';
  blacklistCreatedBy = '';

  blacklistError: string | null = null;
  blacklistSuccess: string | null = null;

  isBlacklistStatusLoading = true;
  isBlacklisted = false;
  activeBlacklistRecord: BlacklistResponse | null = null;
  blacklistStatusError: string | null = null;

  get nationality(): string | null {
    return this.visitDetails?.visitor.nationality ?? null;
  }

  private loadBlacklistStatus(visitorId: string): void {
    this.isBlacklistStatusLoading = true;
    this.blacklistStatusError = null;

    this.blacklistService.getAllBlacklistRecords().subscribe({
      next: (records) => {
        this.activeBlacklistRecord =
          records.find((record) => record.visitorId === visitorId && record.status === 'ACTIVE') ??
          null;

        this.isBlacklisted = this.activeBlacklistRecord !== null;
        this.isBlacklistStatusLoading = false;
        this.blacklistStatusError = null;

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {
        console.error('Failed to load blacklist status:', error);

        this.activeBlacklistRecord = null;
        this.isBlacklisted = false;
        this.isBlacklistStatusLoading = false;
        this.blacklistStatusError = 'Unable to verify blacklist status. Please try again.';

        this.changeDetectorRef.markForCheck();
      },
    });
  }

  ngOnInit(): void {
    const visitId = this.route.snapshot.paramMap.get('visitId');

    if (!visitId) {
      console.error('Visit ID not found in route');
      return;
    }

    this.visitId = visitId;

    this.visitService.getVisitDetails(visitId).subscribe({
      next: (response) => {
        this.visitDetails = response;

        this.loadVisitorPhoto(response.visitor.visitorId);

        this.loadBlacklistStatus(response.visitor.visitorId);

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {
        console.error('Failed to load visit details:', error);
      },
    });
  }

  private loadVisitorPhoto(visitorId: string): void {
    this.isVisitorPhotoLoading = true;

    this.visitService.getVisitorPhoto(visitorId).subscribe({
      next: (photo: Blob) => {
        if (this.visitorPhotoUrl) {
          URL.revokeObjectURL(this.visitorPhotoUrl);
        }

        this.visitorPhotoUrl = URL.createObjectURL(photo);
        this.isVisitorPhotoLoading = false;

        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load visitor photo:', error);

        this.visitorPhotoUrl = null;
        this.isVisitorPhotoLoading = false;

        this.changeDetectorRef.markForCheck();
      },
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.photoError = null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.photoError = 'Please select an image file.';
      input.value = '';
      return;
    }

    this.stopCamera();

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.selectedPhoto = file;
    this.photoPreviewUrl = URL.createObjectURL(file);

    this.checkInError = null;
    this.checkInSuccess = null;

    this.changeDetectorRef.markForCheck();
  }

  discardPhoto(): void {
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.photoPreviewUrl = null;
    this.selectedPhoto = null;
    this.photoError = null;

    if (this.photoInput?.nativeElement) {
      this.photoInput.nativeElement.value = '';
    }

    this.checkInError = null;
    this.checkInSuccess = null;

    this.changeDetectorRef.detectChanges();
  }

  async openCamera(): Promise<void> {
    this.photoError = null;

    if (this.isCapturingPhoto) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      this.photoError = 'Camera access is not supported by this browser.';
      return;
    }

    if (this.isCameraOpen && this.cameraStream) {
      return;
    }

    try {
      this.stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      this.cameraStream = stream;
      this.isCameraOpen = true;

      this.changeDetectorRef.detectChanges();

      const video = this.cameraVideo?.nativeElement;

      if (!video) {
        this.stopCamera();

        this.photoError = 'Unable to initialize the camera preview. Please try again.';
        return;
      }

      video.srcObject = stream;
      await video.play();

      this.discardPhoto();
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Failed to open camera:', error);

      this.stopCamera();

      this.photoError =
        'Unable to access the camera. Please allow camera permission and try again.';

      this.changeDetectorRef.detectChanges();
    }
  }

  capturePhoto(): void {
    if (this.isCapturingPhoto) {
      return;
    }

    const video = this.cameraVideo?.nativeElement;
    const stream = this.cameraStream;

    if (!video || !stream || !this.isCameraOpen) {
      this.photoError = 'Camera is not available.';
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      this.photoError = 'Camera is not ready yet. Please wait a moment and try again.';
      return;
    }

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      this.photoError = 'Unable to capture the photo.';
      return;
    }

    this.isCapturingPhoto = true;
    this.photoError = null;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.isCapturingPhoto = false;
          this.photoError = 'Unable to create the photo.';
          this.changeDetectorRef.detectChanges();
          return;
        }

        const file = new File([blob], `visitor-photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        if (this.photoPreviewUrl) {
          URL.revokeObjectURL(this.photoPreviewUrl);
        }

        this.selectedPhoto = file;
        this.photoPreviewUrl = URL.createObjectURL(file);

        this.stopCamera();

        this.photoError = null;
        this.checkInError = null;
        this.checkInSuccess = null;

        this.changeDetectorRef.detectChanges();
      },
      'image/jpeg',
      0.9,
    );
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (this.cameraVideo?.nativeElement) {
      this.cameraVideo.nativeElement.srcObject = null;
    }

    this.cameraStream = null;
    this.isCameraOpen = false;
    this.isCapturingPhoto = false;

    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.stopCamera();

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }

    if (this.visitorPhotoUrl) {
      URL.revokeObjectURL(this.visitorPhotoUrl);
      this.visitorPhotoUrl = null;
    }
  }

  onIdentityDetailsChanged(): void {
    this.identityVerified = false;
    this.identityVerificationError = null;
    this.identityVerificationSuccess = null;
  }

  onVerifyIdentity(): void {
    if (!this.visitDetails || !this.visitId) {
      this.identityVerificationError = 'Visit details are not available.';
      return;
    }

    if (this.isVerifyingIdentity) {
      return;
    }

    const request: {
      aadharNumber?: string;
      panNumber?: string;
      passportNumber?: string;
    } = {};

    if (this.nationality === 'DOMESTIC') {
      if (!this.aadharNumber.trim() || !this.panNumber.trim()) {
        this.identityVerificationError = 'Please enter both Aadhaar and PAN numbers.';
        return;
      }

      request.aadharNumber = this.aadharNumber.trim();
      request.panNumber = this.panNumber.trim();
    } else if (this.nationality === 'INTERNATIONAL') {
      if (!this.passportNumber.trim()) {
        this.identityVerificationError = 'Please enter the passport number.';
        return;
      }

      request.passportNumber = this.passportNumber.trim();
    } else {
      this.identityVerificationError = 'Nationality is unavailable. Verification cannot proceed.';
      return;
    }

    this.isVerifyingIdentity = true;
    this.identityVerified = false;
    this.identityVerificationError = null;
    this.identityVerificationSuccess = null;
    this.checkInError = null;

    this.visitService.verifyIdentity(this.visitId, request).subscribe({
      next: () => {
        this.isVerifyingIdentity = false;
        this.identityVerified = true;

        this.identityVerificationSuccess =
          'Identity verified successfully. You can now check in the visitor.';

        this.changeDetectorRef.markForCheck();
      },

      error: (error: any) => {
        this.isVerifyingIdentity = false;
        this.identityVerified = false;

        this.identityVerificationError =
          error?.error?.message ||
          error?.error?.detail ||
          'Identity verification failed. Please check the details and try again.';

        this.changeDetectorRef.markForCheck();
      },
    });
  }

  onCheckIn(): void {
    console.log('Check In button clicked');

    if (!this.visitDetails || !this.visitId) {
      this.checkInError = 'Visit details are not available.';
      return;
    }

    if (!this.identityVerified) {
      this.checkInError = 'Please verify the visitor identity before checking in.';
      return;
    }

    if (this.isCheckingIn) {
      return;
    }

    if (!this.selectedPhoto) {
      this.checkInError = 'Please select a visitor photo.';
      return;
    }

    const request: {
      aadharNumber?: string;
      panNumber?: string;
      passportNumber?: string;
    } = {};

    if (this.nationality === 'DOMESTIC') {
      if (!this.aadharNumber.trim() || !this.panNumber.trim()) {
        this.checkInError = 'Please enter both Aadhaar and PAN numbers.';
        return;
      }

      request.aadharNumber = this.aadharNumber.trim();
      request.panNumber = this.panNumber.trim();
    } else if (this.nationality === 'INTERNATIONAL') {
      if (!this.passportNumber.trim()) {
        this.checkInError = 'Please enter the passport number.';
        return;
      }

      request.passportNumber = this.passportNumber.trim();
    } else {
      this.checkInError = 'Nationality is unavailable. Check-in cannot proceed.';
      return;
    }

    this.isCheckingIn = true;
    this.checkInError = null;
    this.checkInSuccess = null;

    this.visitService.checkIn(this.visitId, request, this.selectedPhoto).subscribe({
      next: (response) => {
        this.visitDetails = response;
        this.isCheckingIn = false;

        this.checkInSuccess = 'Visitor checked in successfully.';

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {
        this.isCheckingIn = false;

        this.checkInError =
          error?.error?.message ||
          error?.error?.detail ||
          'Check-in failed. Please verify the details and try again.';

        this.changeDetectorRef.markForCheck();
      },
    });
  }

  onCheckOut(): void {
    if (!this.visitDetails || !this.visitId) {
      this.checkOutError = 'Visit details are not available.';
      return;
    }

    if (this.isCheckingOut) {
      return;
    }

    if (this.visitDetails.status !== 'CHECKED_IN') {
      this.checkOutError = 'Only a checked-in visit can be checked out.';
      return;
    }

    this.isCheckingOut = true;
    this.checkOutError = null;
    this.checkOutSuccess = null;

    this.visitService.checkOut(this.visitId).subscribe({
      next: (response) => {
        this.visitDetails = response;
        this.isCheckingOut = false;

        this.checkOutSuccess = 'Visitor checked out successfully.';

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {
        this.isCheckingOut = false;

        this.checkOutError =
          error?.error?.message || error?.error?.detail || 'Check-out failed. Please try again.';

        this.changeDetectorRef.markForCheck();
      },
    });
  }

  openBlacklistForm(): void {
    this.showBlacklistForm = true;
    this.blacklistError = null;
    this.blacklistSuccess = null;
  }

  cancelBlacklistForm(): void {
    if (this.isAddingToBlacklist) {
      return;
    }

    this.showBlacklistForm = false;
    this.blacklistReason = '';
    this.blacklistCreatedBy = '';
    this.blacklistError = null;
  }

  confirmAddToBlacklist(): void {
    if (!this.visitDetails) {
      this.blacklistError = 'Visit details are not available.';
      return;
    }

    if (this.isAddingToBlacklist) {
      return;
    }

    const reason = this.blacklistReason.trim();
    const createdBy = this.blacklistCreatedBy.trim();

    if (reason.length < 3 || reason.length > 255) {
      this.blacklistError = 'Reason must be between 3 and 255 characters.';
      return;
    }

    if (!createdBy) {
      this.blacklistError = 'Please enter the staff identifier.';
      return;
    }

    const visitorId = this.visitDetails.visitor.visitorId;

    if (!visitorId) {
      this.blacklistError = 'Visitor ID is unavailable.';
      return;
    }

    const request: AddVisitorToBlacklistRequest = {
      reason,
      createdBy,
    };

    this.isAddingToBlacklist = true;
    this.blacklistError = null;
    this.blacklistSuccess = null;

    this.blacklistService.addExistingVisitorToBlacklist(visitorId, request).subscribe({
      next: (response) => {
        this.isAddingToBlacklist = false;
        this.showBlacklistForm = false;

        this.activeBlacklistRecord = response;
        this.isBlacklisted = response.status === 'ACTIVE';
        this.isBlacklistStatusLoading = false;

        this.blacklistSuccess = `${response.visitorName} was added to the blacklist successfully.`;

        this.blacklistReason = '';
        this.blacklistCreatedBy = '';

        this.changeDetectorRef.markForCheck();
      },

      error: (error) => {
        this.isAddingToBlacklist = false;

        this.blacklistError =
          error?.error?.message ||
          error?.error?.detail ||
          'Failed to add visitor to the blacklist. Please try again.';

        this.changeDetectorRef.markForCheck();
      },
    });
  }

  formatVisitDate(dateTime: string): string {
    return new Date(dateTime).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  formatVisitTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  getVisitDayLabel(): string {
    if (!this.visitDetails) {
      return '';
    }

    const visitDate = new Date(this.visitDetails.expectedArrivalAt);

    const today = new Date();

    const visitDay = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());

    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const differenceInMilliseconds = visitDay.getTime() - todayDate.getTime();

    const differenceInDays = Math.round(differenceInMilliseconds / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) {
      return 'Today';
    }

    if (differenceInDays === 1) {
      return 'Tomorrow';
    }

    if (differenceInDays === -1) {
      return 'Yesterday';
    }

    if (differenceInDays > 1) {
      return `Upcoming · In ${differenceInDays} days`;
    }

    return `${Math.abs(differenceInDays)} days ago`;
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
