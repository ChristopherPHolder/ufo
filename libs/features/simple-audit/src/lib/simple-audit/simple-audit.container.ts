import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsDisplayComponent, UserFlowFormComponent } from 'core-ui';
import { RxState } from '@rx-angular/state';
import { SimpleAuditAdapter } from './simple-audit.adapter';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AuditStatusType } from 'shared';
import { map, startWith, tap } from 'rxjs';
import { IfModule } from '@rx-angular/template/if';
import { RxActionFactory } from '@rx-angular/state/actions';

type ContainerState = {
  progress: AuditStatusType;
  // @TODO remove optional as state is lazy
  htmlReportUrl?: string;
  isOnline: boolean;
}

type UiActions = {
  submit: string;
}

@Component({
  selector: 'app-simple-audit',
  standalone: true,
  imports: [CommonModule, UserFlowFormComponent, ResultsDisplayComponent, IfModule],
  template: `
    <div class='audit-heading-container'>
      <h1 class='audit-section-title'>Flow Audits</h1>
      <p>Measure your sites web performance on more then just the initial load</p>
    </div>

    <div class='audit-form-box'>
      <app-user-flow-form
        [disabled]="state.select('isOnline')"
        (auditSubmit)='ui.submit($event)'
      ></app-user-flow-form>
    </div>

    <app-results-display
      *rxIf='resultsBoxVisible$'
      [htmlReportUrl]="state.select('htmlReportUrl')"
      [progress]="state.select('progress')"
    ></app-results-display>
  `,
  styleUrls: ['./simple-audit.container.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RxState, RxActionFactory],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class SimpleAuditContainer {

  ui = this.actions.create();
  resultsBoxVisible$ = this.state.select(map(({ progress }) => progress !== 'idle'));

  constructor(
    private actions: RxActionFactory<UiActions>,
    private adapter: SimpleAuditAdapter,
    public state: RxState<ContainerState>,
  ) {
    this.state.connect(
      'htmlReportUrl',
      this.adapter.results$.pipe(map(({ htmlReportUrl }) => htmlReportUrl)),
    );
    this.state.connect(
      'progress',
      this.adapter.progress$.pipe(startWith('idle' as AuditStatusType)),
    );
    this.state.connect('isOnline', this.adapter.isOnline$);

    this.adapter.initHandleAudit(this.ui.submit$.pipe(tap(i=>console.log('!!!!!!!!!!!', i))));
  }
}
