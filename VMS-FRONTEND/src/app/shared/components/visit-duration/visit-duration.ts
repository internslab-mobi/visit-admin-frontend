
import {
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';

@Component({
  selector: 'app-visit-duration',
  standalone: true,
  template: `<span>{{ formattedDuration }}</span>`
})
export class VisitDurationComponent implements OnInit, OnDestroy {
  @Input() totalSeconds: number | null = null;
  @Input() status = 'REGISTERED';
  @Input() checkedInAt: string | null = null;

  currentTime = Date.now();
  private timerId?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (this.status === 'CHECKED_IN' && this.checkedInAt) {
      this.timerId = setInterval(() => {
        this.currentTime = Date.now();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  get formattedDuration(): string {
    if (this.status === 'REGISTERED') {
      return 'Not started';
    }

    if (
      this.status === 'CANCELLED' ||
      this.status === 'NO_SHOW'
    ) {
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

    if (
      this.status === 'CHECKED_OUT' &&
      this.totalSeconds !== null
    ) {
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
