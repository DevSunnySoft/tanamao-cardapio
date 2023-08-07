import { DatePipe } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, Observable, Subscription } from "rxjs";
import { AppService } from "src/app/app.service";
import IUser from "src/app/users/user";
import { OrderOdsService } from "../order.ods.service";
import { OrderService } from "../order.service";
import { ISummaryOrder, SummaryOrderPocStatus, SummaryOrderPocStatusText } from "../summary-order";

@Component({
  templateUrl: 'summary-order-component.html',
  styleUrls: ['summary-order.component.sass']
})
export class SummaryOrderComponent implements AfterViewInit, OnInit, OnDestroy {
  private _subscriptions: Subscription[] = []

  public readonly user$:Observable<IUser | undefined> = this._appService.user$
  public readonly SummaryOrderPocStatusText = SummaryOrderPocStatusText
  public readonly SummaryOrderPocStatus = SummaryOrderPocStatus

  public order?: ISummaryOrder
  public items$ = this._orderOdsService.items$
  public noOrder = false

  public readonly orderResumeDescriptions = [
    'pendente(s)', 'enviado(s)'
  ]

  constructor(
    private _router: Router,
    private _appService: AppService,
    private _orderService: OrderService,
    private _orderOdsService: OrderOdsService,
    private _cdr: ChangeDetectorRef,
    private _datePipe: DatePipe
  ) {
    this._cdr.detach()
  }

  private getOrder(summaryid: string) {
    firstValueFrom(this._orderService.getSummaryOrder(summaryid)).then(order => {
      this.order = order;
      this._cdr.detectChanges();
    })
  }

  public formatQuantity(value: number): string {
    switch (value) {
      case 0.2:
        return '1/5'
      case 0.25:
        return '1/4'
      case 0.33:
        return '1/3'
      case 0.34:
        return '1/3'
      case 0.5:
        return '1/2'
      default:
        return value.toString()
    }
  }

  public formatTime(arg: string): string {
    const value = new Date(arg)
    const today = new Date()
    const dif = today.getDate() - value.getDate()
    let date: string

    if (dif === 0)
      date = 'Hoje às ' + this._datePipe.transform(value, 'HH:mm')
    else
    if (dif === 1)
      date = 'Ontem às' + this._datePipe.transform(value, 'HH:mm')
    else
      date = this._datePipe.transform(value, 'dd/MM/yy HH:mm') || ''

    return date
  }

  public onClickQrScanner(): void {
    this._router.navigate(['scanner'])
  }

  public onClickHome(): void {
    this._router.navigate([``])
  }

  public onClickBasket(): void {
    this._router.navigate(['basket'])
  }

  public onClickBack(): void {
    if (window)
      window.history.back()
  }

  public onClickSummary(): void {
    this._router.navigate(['summary'])
  }

  onClickCloseRequest(): void {
    this._router.navigate(['close'])
  }

  public onClickUser(): void {
    this._router.navigate(['me'])
  }

  ngAfterViewInit(): void {
    this._subscriptions.push(
      this.user$.subscribe(user => {
        if (user?.localorder) {
          this.getOrder(user?.localorder._id)
          this.noOrder = false
        } else 
          this.noOrder = true

        this._cdr.detectChanges()
      })
    ),
    
    this.items$.subscribe(() => this._cdr.detectChanges())
  }

  ngOnInit(): void {
    this._subscriptions.push(
      this._appService.onnotificationchange.subscribe(() => {
        if (this.order)
          this.getOrder(this.order._id)
      })
    )
    
    this._cdr.detectChanges()
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(sub => sub.unsubscribe())
  }

}