import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AppService } from "../app.service";
import { OrderOdsService } from "../orders/order.ods.service";

@Component({
  templateUrl: 'user.component.html',
  styleUrls: ['user.component.sass']
})
export class UserComponent implements OnInit, AfterViewInit, OnDestroy {
  private _subscriptions: Subscription[] = []
  
  public module: string | null = ''
  public readonly items$ = this._orderOdsService.items$
  //public user?: IUse

  constructor(
    private _appService: AppService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _route: ActivatedRoute,
    private _orderOdsService: OrderOdsService
  ) {
    this._cdr.detach()
  }

  public onClickCompany(companyuri: string): void {
    this._router.navigate([companyuri])
  }

  public onClickOrders(): void {
    this._router.navigate(['me'])
  }

  public companyImage(uri: string): string {
    return this._appService.getMiniatureImage(uri)
  }

  public onClickProfile(): void {
    this._router.navigate(['me/profile'], {replaceUrl: true})
  }

  public onClickLogout(): void {
    this._router.navigate(['logout'])
  }

  public onClickQrScanner(): void {
    this._router.navigate(['scanner'], {replaceUrl: true})
  }

  public onClickHome(): void {
    this._router.navigate([``])
  }

  public onClickBasket(): void {
    this._router.navigate(['basket'])
  }

  public onClickOrder() {
    this._router.navigate(['order'])
  }

  public onClickUser(): void {
    this._router.navigate(['me'])
  }

  public onClickBack(): void {
    if (window)
      window.history.back()
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(v => v.unsubscribe)
  }

  ngAfterViewInit(): void {
    this._subscriptions.push(
      this.items$.subscribe(() => this._cdr.detectChanges())
    )    
  }
  
  ngOnInit(): void {
    const md = this._route.snapshot.paramMap.get('module')
    if( md ) this.module = md

    this._cdr.detectChanges()
  }

}