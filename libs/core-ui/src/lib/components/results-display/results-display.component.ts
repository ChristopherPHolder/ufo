import { ChangeDetectionStrategy, Component, ViewEncapsulation, NgModule, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import { LoadingSpinnerComponentModule } from '../loading-spinner/loading-spinner.component';
import { map, Observable } from 'rxjs';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AuditRunStatus, ResultProgress, BypassSrcDirective} from 'shared';
import { RxState } from '@rx-angular/state';

const progressMap: Record<ResultProgress, string> = {
  idle: "idle result",
  loading: "Loading the result",
  done: "",
}

type ComponentState = {
  toastText: string;
  htmlReportUrl?: SafeResourceUrl;
}
@Component({
  selector: 'app-results-display',
  templateUrl: './results-display.component.html',
  styleUrls: ['./results-display.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxState]
})
export class ResultsDisplayComponent {
  @Input() set progress (progress$: Observable<ResultProgress>) {
    this.state.connect('toastText', progress$.pipe(map(v => progressMap[v])));
  }
  @Input() set htmlReportUrl (htmlReportUrl$: Observable<string | undefined>) {
    this.state.connect('htmlReportUrl', htmlReportUrl$.pipe(map(v => this.sanitizeUrl(v as string))));
  }
  constructor(
    public state: RxState<ComponentState>,
  ) {}
}

@NgModule({
  imports: [
    CommonModule,
    BypassSrcDirective,
    LoadingSpinnerComponentModule,
    AuditProgressToasterComponent,
    IfModule
  ],
  declarations: [ResultsDisplayComponent],
  exports: [ResultsDisplayComponent],
})
export class ResultsDisplayComponentModule {}
