import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { VisitService } from '../../../core/services/visit/visit.service';
import { VisitDetailResponse } from '../../../core/models/visit/visit-detail.model';

import { BlacklistService } from '../../../core/services/blacklist/blacklist.service';

@Component({
  selector: 'app-visit-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './visit-details.html',
  styleUrl: './visit-details.css',
})
export class VisitDetailsComponent implements OnInit, OnDestroy {
  private visitId: string | null = null;

  visitDetails: VisitDetailResponse | null = null;

  visitorPhotoUrl: string | null = null;

  selectedPhoto: File | null = null;
  photoPreviewUrl: string | null = null;
  photoError: string | null = null;

  capturedPhotoFile: File | null = null;
  capturedPhotoPreviewUrl: string | null = null;

  isCameraOpen = false;
  isCapturingPhoto = false;

  private cameraStream: MediaStream | null = null;

  aadharNumber = '';
  panNumber = '';
  passportNumber = '';

  isVerifyingIdentity = false;
  identityVerified = false;
  identityVerificationError: string | null = null;

  isCheckingIn = false;
  checkInError: string | null = null;
  checkInSuccess: string | null = null;

  isCheckingOut = false;
  checkOutError: string | null = null;
  checkOutSuccess: string | null = null;

  showCancelConfirmation = false;
  isCancellingVisit = false;
  cancelVisitError: string | null = null;

  isBlacklistStatusLoading = true;
  isBlacklisted = false;
  blacklistStatusError: string | null = null;

  @ViewChild('videoElement')
  cameraVideo?: ElementRef<HTMLVideoElement>;

  @ViewChild('photoInput')
  photoInput?: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly visitService = inject(VisitService);
  private readonly blacklistService = inject(BlacklistService);
  private readonly cdr = inject(ChangeDetectorRef);

  get nationality(): string | null {
    return this.visitDetails?.visitor.nationality ?? null;
  }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get('visitId');

    if (!this.visitId) {
      return;
    }

    this.visitService.getVisitDetails(this.visitId).subscribe({
      next: (response) => {
        this.visitDetails = response;

        this.loadVisitorPhoto(response.visitor.visitorId);
        this.loadBlacklistStatus();

        this.cdr.detectChanges();
      },

      error: () => {
        this.visitDetails = null;
        this.isBlacklistStatusLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  loadVisitorPhoto(visitorId: string): void {
    this.visitService.getVisitorPhoto(visitorId).subscribe({
      next: (blob) => {
        if (this.visitorPhotoUrl) {
          URL.revokeObjectURL(this.visitorPhotoUrl);
        }

        this.visitorPhotoUrl = URL.createObjectURL(blob);

        this.cdr.detectChanges();
      },

      error: () => {
        this.visitorPhotoUrl = null;

        this.cdr.detectChanges();
      },
    });
  }

  /**
   * Builds the identity request expected by the backend.
   *
   * The same request is used for both:
   * - identity verification
   * - check-in
   */
  private buildIdentityRequest(): {
    aadharNumber?: string;
    panNumber?: string;
    passportNumber?: string;
  } {
    const identityRequest: {
      aadharNumber?: string;
      panNumber?: string;
      passportNumber?: string;
    } = {};

    if (this.nationality === 'DOMESTIC') {
      identityRequest.aadharNumber = this.aadharNumber;
      identityRequest.panNumber = this.panNumber;
    } else if (this.nationality === 'INTERNATIONAL') {
      identityRequest.passportNumber = this.passportNumber;
    }

    return identityRequest;
  }

  /**
   * Identity verification becomes invalid whenever
   * the identity values are changed after verification.
   */
  onIdentityFieldChanged(): void {
    if (this.identityVerified) {
      this.identityVerified = false;
    }

    this.identityVerificationError = null;
  }

  onVerifyIdentity(): void {
    if (!this.visitId || !this.visitDetails || !this.nationality) {
      return;
    }

    this.isVerifyingIdentity = true;
    this.identityVerificationError = null;

    const identityRequest = this.buildIdentityRequest();

    this.visitService.verifyIdentity(this.visitId, identityRequest).subscribe({
      next: () => {
        this.identityVerified = true;
        this.isVerifyingIdentity = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        this.identityVerified = false;

        this.identityVerificationError = error?.error?.message || 'Identity verification failed.';

        this.isVerifyingIdentity = false;

        this.cdr.detectChanges();
      },
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.photoError = null;

    if (!file.type.startsWith('image/')) {
      this.photoError = 'Please select a valid image.';
      input.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.photoError = 'Photo size must not exceed 5 MB.';
      input.value = '';
      return;
    }

    this.stopCamera();

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.selectedPhoto = file;
    this.photoPreviewUrl = URL.createObjectURL(file);

    input.value = '';

    this.cdr.detectChanges();
  }

  discardPhoto(): void {
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.selectedPhoto = null;
    this.photoPreviewUrl = null;
    this.photoError = null;

    if (this.photoInput?.nativeElement) {
      this.photoInput.nativeElement.value = '';
    }

    this.cdr.detectChanges();
  }

  async openCamera(): Promise<void> {
    this.photoError = null;

    if (!navigator.mediaDevices?.getUserMedia) {
      this.photoError =
        'Camera access is not supported by this browser. Please upload a photo instead.';

      this.cdr.detectChanges();
      return;
    }

    try {
      /*
       * Make sure there is no previous camera session
       * or stale captured-photo review state.
       */
      this.stopCamera();

      this.clearCapturedPhoto();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
        },
        audio: false,
      });

      this.cameraStream = stream;
      this.isCameraOpen = true;

      this.cdr.detectChanges();

      setTimeout(() => {
        const video = this.cameraVideo?.nativeElement;

        if (!video) {
          this.photoError = 'Unable to initialize the camera preview.';

          this.stopCamera();

          this.cdr.detectChanges();
          return;
        }

        video.srcObject = stream;

        video.play().catch((error) => {
          console.error('Unable to start camera preview:', error);

          this.photoError = 'Unable to start the camera preview. Please try again.';

          this.stopCamera();

          this.cdr.detectChanges();
        });
      });
    } catch (error) {
      console.error('Camera access failed:', error);

      this.stopCamera();

      this.photoError =
        'Unable to access the camera. Please check camera permissions or upload a photo instead.';

      this.cdr.detectChanges();
    }
  }

  capturePhoto(): void {
    const video = this.cameraVideo?.nativeElement;

    if (!video || !this.cameraStream) {
      this.photoError = 'Camera is not available. Please try again.';
      this.cdr.detectChanges();
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      this.photoError = 'Camera is not ready yet. Please try again.';
      this.cdr.detectChanges();
      return;
    }

    this.isCapturingPhoto = true;
    this.photoError = null;

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    if (!context) {
      this.photoError = 'Unable to capture photo.';
      this.isCapturingPhoto = false;

      this.cdr.detectChanges();
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.photoError = 'Unable to capture photo.';
          this.isCapturingPhoto = false;

          this.cdr.detectChanges();
          return;
        }

        const file = new File([blob], `visitor-photo-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });

        if (this.capturedPhotoPreviewUrl) {
          URL.revokeObjectURL(this.capturedPhotoPreviewUrl);
        }

        this.capturedPhotoFile = file;
        this.capturedPhotoPreviewUrl = URL.createObjectURL(file);

        this.stopCameraStream();

        this.isCapturingPhoto = false;

        this.cdr.detectChanges();
      },
      'image/jpeg',
      0.9,
    );
  }

  /**
   * Releases the browser camera stream.
   */
  private stopCameraStream(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    this.cameraStream = null;

    const video = this.cameraVideo?.nativeElement;

    if (video) {
      video.pause();
      video.srcObject = null;
    }
  }

  /**
   * Clears a captured photo that has not yet been
   * transferred into selectedPhoto.
   */
  private clearCapturedPhoto(): void {
    if (this.capturedPhotoPreviewUrl) {
      URL.revokeObjectURL(this.capturedPhotoPreviewUrl);
    }

    this.capturedPhotoFile = null;
    this.capturedPhotoPreviewUrl = null;
  }

  useCapturedPhoto(): void {
    if (!this.capturedPhotoFile || !this.capturedPhotoPreviewUrl) {
      return;
    }

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.selectedPhoto = this.capturedPhotoFile;
    this.photoPreviewUrl = this.capturedPhotoPreviewUrl;

    this.capturedPhotoFile = null;
    this.capturedPhotoPreviewUrl = null;

    this.isCameraOpen = false;
    this.photoError = null;

    this.cdr.detectChanges();
  }

  async retakePhoto(): Promise<void> {
    if (this.capturedPhotoPreviewUrl) {
      URL.revokeObjectURL(this.capturedPhotoPreviewUrl);
    }

    this.capturedPhotoFile = null;
    this.capturedPhotoPreviewUrl = null;

    await this.openCamera();
  }

  stopCamera(): void {
    this.stopCameraStream();

    this.isCameraOpen = false;
    this.isCapturingPhoto = false;
  }

  onCheckIn(): void {
    if (!this.visitId || !this.visitDetails || this.visitDetails.status !== 'REGISTERED') {
      return;
    }

    if (this.isBlacklistStatusLoading) {
      this.checkInError = 'Check-in is unavailable while blacklist status is being verified.';
      return;
    }

    if (this.isBlacklisted) {
      this.checkInError = 'Check-in is unavailable while this visitor is blacklisted.';
      return;
    }

    if (this.blacklistStatusError) {
      this.checkInError = 'Check-in is unavailable because blacklist status could not be verified.';
      return;
    }

    if (!this.identityVerified) {
      this.checkInError = 'Identity verification is required before check-in.';
      return;
    }

    if (!this.selectedPhoto) {
      this.checkInError = 'Visitor photo is required before check-in.';
      return;
    }

    const identityRequest = this.buildIdentityRequest();

    this.isCheckingIn = true;
    this.checkInError = null;
    this.checkInSuccess = null;

    this.visitService.checkIn(this.visitId, identityRequest, this.selectedPhoto).subscribe({
      next: (response) => {
        if (this.visitDetails) {
          this.visitDetails = {
            ...this.visitDetails,
            status: response.status,
            checkedInAt: response.checkedInAt,
          };
        }

        this.isCheckingIn = false;

        this.checkInSuccess = 'Visitor checked in successfully.';

        this.cdr.detectChanges();
      },

      error: (error) => {
        this.checkInError = error?.error?.message || 'Unable to check in visitor.';

        this.isCheckingIn = false;

        this.cdr.detectChanges();
      },
    });
  }

  onCheckOut(): void {
    if (!this.visitId || !this.visitDetails || this.visitDetails.status !== 'CHECKED_IN') {
      return;
    }

    this.isCheckingOut = true;
    this.checkOutError = null;
    this.checkOutSuccess = null;

    this.visitService.checkOut(this.visitId).subscribe({
      next: (response) => {
        if (this.visitDetails) {
          this.visitDetails = {
            ...this.visitDetails,
            status: response.status,
            checkedOutAt: response.checkedOutAt,
          };
        }

        this.isCheckingOut = false;

        this.checkOutSuccess = 'Visitor checked out successfully.';

        this.cdr.detectChanges();
      },

      error: (error) => {
        this.checkOutError = error?.error?.message || 'Unable to check out visitor.';

        this.isCheckingOut = false;

        this.cdr.detectChanges();
      },
    });
  }

  openCancelConfirmation(): void {
    if (!this.visitDetails || this.visitDetails.status !== 'REGISTERED') {
      return;
    }

    this.cancelVisitError = null;
    this.showCancelConfirmation = true;
  }

  closeCancelConfirmation(): void {
    if (this.isCancellingVisit) {
      return;
    }

    this.showCancelConfirmation = false;
    this.cancelVisitError = null;
  }

  onCancelVisit(): void {
    if (!this.visitId || !this.visitDetails || this.visitDetails.status !== 'REGISTERED') {
      return;
    }

    this.isCancellingVisit = true;
    this.cancelVisitError = null;

    this.visitService.cancelVisit(this.visitId).subscribe({
      next: (response) => {
        if (this.visitDetails) {
          this.visitDetails = {
            ...this.visitDetails,
            status: response.status,
          };
        }

        this.showCancelConfirmation = false;
        this.isCancellingVisit = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        this.cancelVisitError = error?.error?.message || 'Unable to cancel visit.';

        this.isCancellingVisit = false;

        this.cdr.detectChanges();
      },
    });
  }

  loadBlacklistStatus(): void {
    const visitorId = this.visitDetails?.visitor.visitorId;

    if (!visitorId) {
      this.isBlacklistStatusLoading = false;
      return;
    }

    this.isBlacklistStatusLoading = true;
    this.blacklistStatusError = null;

    this.blacklistService.isBlacklisted(visitorId).subscribe({
      next: (isBlacklisted: boolean) => {
        this.isBlacklisted = isBlacklisted;
        this.isBlacklistStatusLoading = false;
      },

      error: (error) => {
        console.error('Blacklist status request failed:', error);

        this.isBlacklistStatusLoading = false;
        this.blacklistStatusError = 'Unable to determine blacklist status.';
      },
    });
  }

  formatVisitDate(dateTime: string | null | undefined): string {
    if (!dateTime) {
      return '';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateTime));
  }

  formatVisitTime(dateTime: string | null | undefined): string {
    if (!dateTime) {
      return '';
    }

    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateTime));
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'REGISTERED':
        return 'Registered';

      case 'CHECKED_IN':
        return 'Checked In';

      case 'CHECKED_OUT':
        return 'Checked Out';

      case 'CANCELLED':
        return 'Cancelled';

      case 'NO_SHOW':
        return 'No Show';

      default:
        return status;
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();

    if (this.visitorPhotoUrl) {
      URL.revokeObjectURL(this.visitorPhotoUrl);
    }

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    /*
     * capturedPhotoPreviewUrl is normally already cleared
     * by stopCamera(), but keeping this cleanup makes
     * destruction safe even if the state changes later.
     */
    if (this.capturedPhotoPreviewUrl) {
      URL.revokeObjectURL(this.capturedPhotoPreviewUrl);
    }
  }
}
