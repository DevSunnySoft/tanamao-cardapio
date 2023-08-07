import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, Subscription } from "rxjs";
import { AppService } from "src/app/app.service";
import { slideXToggleAnimation } from "src/app/utils/animations/slide-x-toggle.animation";
import { LocalOrder, LocalOrderStatus } from "../local-order";
import { OrderService } from "../order.service";
import { ISummaryOrder, SummaryOrderPocStatus } from "../summary-order";

@Component({
  selector: 'app-order-alert',
  templateUrl: 'order-alert.component.html',
  styleUrls: ['order-alert.component.sass'],
  animations: [slideXToggleAnimation]
})
export class OrderAlertComponent implements AfterViewInit, OnInit, OnDestroy {
  private _subscriptions: Subscription[] = []
  private summaryOrderId?: string

  public resume: any = {
    [LocalOrderStatus.pendent]: 0,
    [LocalOrderStatus.rejected]: 0,
    [LocalOrderStatus.error]: 0
  }

  public summaryOrder?: ISummaryOrder
  public readonly SummaryOrderPocStatus = SummaryOrderPocStatus
  public readonly LocalOrderStatus = LocalOrderStatus

  constructor(
    private _orderService: OrderService,
    private _cdr: ChangeDetectorRef,
    private _appService: AppService,
    private _router: Router
  ) { }

  private resumeOrder(resume: any, status: LocalOrderStatus): void {
    const idx = resume.findIndex((item: any) => item._id === status)
    this.resume[status] = (idx >= 0) ? resume[idx].totalCount : 0
  }

  private getSummaryOrder(): void {
    if (this.summaryOrderId) {

      firstValueFrom(this._orderService.getSummaryOrder(this.summaryOrderId))
        .then(summary => {
          if (summary?.pocstatus === SummaryOrderPocStatus.closed)
            this.closeAndClear()

          this.summaryOrder = summary
    
          if (summary?.resume) {
            this.resumeOrder(summary.resume, LocalOrderStatus.pendent)
            this.resumeOrder(summary.resume, LocalOrderStatus.rejected)
            this.resumeOrder(summary.resume, LocalOrderStatus.error)
          }
    
          this._cdr.detectChanges()
        })

    }
  }

  private closeAndClear() {
    this._router.navigate(['close'], { queryParams: {clear: true} })
  }

  private close() {
    this._router.navigate(['close'])
  }

  public onClickOrder() {
    this._router.navigate(['order'])
  }

  public onClickSummary() {
    this._router.navigate(['summary'])
  }

  public ngAfterViewInit(): void {
    this._subscriptions.push(
      this._appService.user$.subscribe(user => {
        if (user && user.localorder) {
          this.summaryOrderId = user.localorder._id
          this.getSummaryOrder()
        }
      })
    )
  }

  public ngOnInit(): void {    
    this._subscriptions.push(
      this._appService.onnotificationchange.subscribe(() =>
        this.getSummaryOrder()
      )
    )
    
    this._cdr.detectChanges()
  }

  public ngOnDestroy(): void {
    this._subscriptions.forEach(item => item.unsubscribe())
  }

}