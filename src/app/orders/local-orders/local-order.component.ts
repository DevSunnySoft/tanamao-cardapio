import { DatePipe } from "@angular/common";
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, distinctUntilChanged, firstValueFrom, Subscription } from "rxjs";
import { AppService } from "src/app/app.service";
import { StyleService } from "src/app/utils/styles/styles.service";
import { LocalOrder, LocalOrderStatus, LocalOrderSyncStatus } from "../local-order";
import { OrderOdsService } from "../order.ods.service";
import { OrderService } from "../order.service";
import { ISummaryOrder } from "../summary-order";
import { OrderDetailComponent } from "./details/order-detail.component";

@Component({
  selector: 'app-local-order',
  templateUrl: 'local-order.component.html',
  styleUrls: ['local-orders.component.sass']
})
export class LocalOrderComponent implements AfterViewInit, OnInit, OnDestroy {
  private _orders: BehaviorSubject<LocalOrder[]> = new BehaviorSubject<LocalOrder[]>([])
  private _subscriptions: Subscription[] = []
  private summaryOrderId?: string
  
  public isLoading = true
  public noOrder = false
  
  public readonly orders$ = this._orders.asObservable()
  public readonly LocalOrderSyncStatus = LocalOrderSyncStatus
  public sendingOrders = false
  public orderDetailDialogConfig = { component: OrderDetailComponent }

  public summaryorder?: ISummaryOrder

  constructor(
    private _ordersService: OrderService,
    private _appService: AppService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _orderOdsService: OrderOdsService,
    private _datePipe: DatePipe,
    styleService: StyleService
  ) {
    this._cdr.detach()
    styleService.loadStyle('mat-dialog')
  }

  private getLocalOrders() {
    if (this.summaryOrderId) {
      firstValueFrom(this._ordersService.getOrders(this.summaryOrderId))
      .then(response => {
        if (response.data.length > 0) {
          if (response.data.findIndex(order => order.syncstatus === LocalOrderSyncStatus.pendent) === -1)
            this.sendingOrders = false
          else
            this.sendingOrders = true

          this.noOrder = false
          this._orders.next(response.data)
        } else {
          this.sendingOrders = false;
          this.noOrder = true;
        }

        this.isLoading = false;
        this._cdr.detectChanges();
      })
    }
  }

  private orderStatusText: any = {
    [LocalOrderStatus.pendent]: 'Enviando...',
    [LocalOrderStatus.success]: 'Enviado',
    [LocalOrderStatus.error]: 'Ocorreu um erro'
  }

  private orderStatusReject: any = {
    0: 'Ponto não encontrado', 
    1: 'Ponto em fechamento', 
    2: 'A mesa não existe', 
    3: 'Produto indisponível'
  }

  public orderStatusIcon: any = {
    [LocalOrderStatus.pendent]: {color: 'color-wipedout', icon:'schedule'},
    [LocalOrderStatus.success]: {color: 'read', icon: 'done_all'},
    [LocalOrderStatus.error]: {color: 'color-warn', icon: 'error'},
    [LocalOrderStatus.rejected]: {color: 'color-warn', icon: 'error'},
  }

  writeStatusText(order: LocalOrder): string {
    if (order.orderstatus === LocalOrderStatus.rejected) {
      if (order.rejection)
        return `Falha: ${this.writeStatusRejectText(order.rejection)}`
      else
        return 'Falha'
    } else
      return this.orderStatusText[order.orderstatus]
  }

  writeStatusRejectText(reject: any): string {
    if (reject.code === 2) {
      return `A mesa ${reject.detail} não existe`
    } else
      return this.orderStatusReject[reject.code]
  }

  public onClickBack(): void {
    this._router.navigate(['..'])
  }

  public onClickSummary(): void {
    this._router.navigate(['summary'])
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

  public onClickUser(): void {
    this._router.navigate(['me'])
  }

  public onClickRetryOrder(ev: Event, order: LocalOrder) {
    ev.stopPropagation()
    
    this._orderOdsService.recoveOrder = order
    this._router.navigate(['checkout'], {queryParams: {recover: true}})
  }

  public onClickUpdateQRCode(ev: Event) {
    ev.stopPropagation()
    this._router.navigate(['scanner'], {queryParams: {change: true}})
  }

  public showDateInfo(date: Date | undefined | string) {
    
    if (date) {
      const dt = new Date(date)
      const td = new Date()
      const dif = Math.floor(td.getTime() - dt.getTime())/(24*3600*1000)

      if (dif === 0)
        return `Hoje às ${this._datePipe.transform(date, 'HH:mm')}`
      else
      if (dif === -1)
        return `Ontem às ${this._datePipe.transform(date, 'HH:mm')}`
      else
        return `${this._datePipe.transform(date, 'dd/MM/yy HH:mm')}`
    }
    
    return ''
  }

  public onCloseOrderDetail(ev: any) {}
  
  ngAfterViewInit(): void {
    this._subscriptions.push(
      this._appService.user$.pipe(distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current))).subscribe(user => {

        if (user) {
          if (user.localorder) {
            
            this.summaryOrderId = user.localorder._id
            this.summaryorder = user.localorder

            this._subscriptions.push(
              this._appService.onnotificationchange.subscribe(() => {
                this.getLocalOrders()
              })
            )

            //this.getLocalOrders()
          } else {
            this.isLoading = false
            this.noOrder = true
          }

          this._cdr.detectChanges()
        }
      })

    )
  }

  ngOnInit(): void {   
    
    this._cdr.detectChanges()
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(item => item.unsubscribe())
  }

}