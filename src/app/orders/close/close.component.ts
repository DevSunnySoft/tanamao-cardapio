import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AppService } from "src/app/app.service";
import { OrderService } from "../order.service";
import { ISummaryOrder, SummaryOrderPocStatus } from "../summary-order";

@Component({
  templateUrl: './close.component.html'
})
export class CloseComponent implements OnInit, AfterViewInit, OnDestroy {
  private summaryOrderId?: string
  private userSubscription?: Subscription
  private subscriptions: Subscription[] = []

  public isLoading = true
  public order?: ISummaryOrder
  public SummaryOrderPocStatus = SummaryOrderPocStatus

  constructor(
    private _orderService: OrderService,
    private _appService: AppService,
    private _cdr: ChangeDetectorRef,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this._cdr.detach()
  }

  private clearData() {
    this._appService.log = 'Conta finalizada com sucesso!'
    this._orderService.scanHash = null
    this._router.navigate(['/'])
  }

  private getOrder() {
    if (this.userSubscription)
      this.userSubscription.unsubscribe()

    if (this.summaryOrderId) {

      this.subscriptions.push(this._orderService.getSummaryOrder(this.summaryOrderId).subscribe(order => {
        this.order = order;
        
        if (order && order.pocstatus === SummaryOrderPocStatus.closed) {
          this.clearData()
        }

        this._cdr.detectChanges();
      }))

    }
  }

  public onClickBack(): void {
    if (window)
      window.history.back()
  }

  public onClickConfirm(): void {
    if (this.summaryOrderId)
      this.subscriptions.push(this._orderService.closeOrder(this.summaryOrderId).subscribe(order => {
        if (order)
          this.order = order

        this._cdr.detectChanges()
      }))
  }

  ngAfterViewInit(): void {
    this.userSubscription = this._appService.user$.subscribe(user => {
      if (user && user.localorder)
        this.summaryOrderId = user.localorder._id

      this.getOrder()
    })
  }

  ngOnDestroy(): void {
    if (this.userSubscription)
      this.userSubscription.unsubscribe()

    this.subscriptions.forEach(sub => sub.unsubscribe())
  }

  ngOnInit(): void {

    if (this._route.snapshot.queryParamMap.get('clear'))
      this.clearData()

    this._cdr.detectChanges()
  }

}