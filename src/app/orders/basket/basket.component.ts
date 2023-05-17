import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AppService } from "src/app/app.service";
import { IOrderBasketItem } from "../order-basket";
import { OrderOdsService } from "../order.ods.service";

@Component({
  templateUrl: 'basket.component.html'
})
export class BasketComponent implements OnInit {
  public isLoading = false

  public readonly items$: Observable<Array<IOrderBasketItem>> = this._orderOdsService.items$
  public readonly total$ = this._orderOdsService.total$
  public readonly price$ = this._orderOdsService.price$

  constructor(
    private _appService: AppService,
    private _orderOdsService: OrderOdsService,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) {
    this._cdr.detach()

    this._appService.company!.businesscatalogs.length > 0 ?
      this._appService.company!.businesscatalogs[0].isopened : false
  }

  private goNext() {
    this._router.navigate([`checkout`])
  }

  public onClickBack(): void {
    if (window)
      window.history.back()
  }

  public onClickKeep() {
    this._router.navigate([''])
  }

  public onClickNavigateNext(): void {
    this.isLoading =  true
    this._cdr.detectChanges()

    this.goNext()
  }

  public onClickClear() {
    this._orderOdsService.clear()
    this.onClickKeep()
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

  public onClickOrder() {
    this._router.navigate(['order'])
  }

  ngOnInit(): void {
    this._cdr.detectChanges()
  }

}