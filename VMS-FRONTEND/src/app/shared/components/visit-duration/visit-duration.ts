import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  inject
} from '@angular/core';

@Component({
  selector: 'app-visit-duration',
  standalone: true,
  template: `<span>{{ formattedDuration }}</span>`
})
export class VisitDurationComponent implements OnChanges, OnDestroy {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() totalSeconds: number | null = null;
  @Input() status = 'REGISTERED';
  @Input() checkedInAt: string | null = null;

  currentTime = Date.now();
  private timerId?: ReturnType<typeof setInterval>;

  ngOnChanges(): void {
  this.syncTimer();
}

ngOnDestroy(): void {
  this.stopTimer();
}

private syncTimer(): void {
  const hasActiveSession = this.sessions?.some(
    session => session.outTime == null
  ) ?? false;

  const shouldRun =
    (this.sessions !== null && hasActiveSession) ||
    (this.sessions === null &&
      this.status === 'CHECKED_IN' &&
      !!this.checkedInAt);

  if (shouldRun && !this.timerId) {
    this.currentTime = Date.now();

    this.timerId = setInterval(() => {
  this.currentTime = Date.now();
  this.cdr.detectChanges();
}, 1000);
  } else if (!shouldRun) {
    this.stopTimer();
  }
}

private stopTimer(): void {
  if (this.timerId) {
    clearInterval(this.timerId);
    this.timerId = undefined;
  }
}

  @Input() sessions: {
  inTime: string;
  outTime: string | null;
  durationSeconds: number;
}[] | null = null;

 get formattedDuration(): string {
  // Visitor Log: calculate total duration across all sessions.
  if (this.sessions !== null) {
    const totalSeconds = this.sessions.reduce(
      (total, session) => {
        if (session.outTime !== null) {
          return total + session.durationSeconds;
        }

        const startTime = new Date(session.inTime).getTime();
        const elapsedSeconds = Math.max(
          0,
          Math.floor((this.currentTime - startTime) / 1000)
        );

        return total + elapsedSeconds;
      },
      0
    );

    return this.formatSeconds(totalSeconds);
  }

  // Visit Details: display duration based on visit status.
  if (this.status === 'REGISTERED') {
    return 'Not started';
  }

  if (this.status === 'CANCELLED' || this.status === 'NO_SHOW') {
    return 'Not applicable';
  }

  if (this.status === 'CHECKED_IN') {
    if (!this.checkedInAt) {
      return 'In progress';
    }

    const startTime = new Date(this.checkedInAt).getTime();
    const elapsedSeconds = Math.max(
      0,
      Math.floor((this.currentTime - startTime) / 1000)
    );

    return this.formatSeconds(elapsedSeconds);
  }

  if (this.status === 'CHECKED_OUT' && this.totalSeconds !== null) {
    return this.formatSeconds(this.totalSeconds);
  }

  return 'Not applicable';
}

  private formatSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];

    if (hours > 0) {
      parts.push(`${hours}h`);
    }

    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }

    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds}s`);
    }

    return parts.join(' ');
  }
}
