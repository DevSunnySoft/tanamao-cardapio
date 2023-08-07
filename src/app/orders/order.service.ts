import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";
import { environment } from "src/environments/environment";
import { AppService } from "../app.service";
import { ApiSearchResponse } from "../utils/global";
import { LocalOrder } from "./local-order";
import { ISummaryOrder, SummaryOrderPocStatus } from "./summary-order";

@Injectable({
  providedIn: "root"
})
export class OrderService {
  private localorderurl = `${environment.servers_urls.main}/localorders`
  private summaryrderurl = `${environment.servers_urls.main}/summaryorders`
  private _scanHash: string | null = null

  get scanHash(): string | null {
    if (!this._scanHash && window)
      this._scanHash = window.sessionStorage.getItem('_SH')

    return this._scanHash
  }

  set scanHash(value: string | null) {
    this._scanHash = value

    if (window) {
      if (value)
        window.sessionStorage.setItem('_SH', value)
      else
        window.sessionStorage.removeItem('_SH')
    }
  }

  constructor(
    private _appService: AppService,
    private _http: HttpClient,
    private _router: Router
  ) {}


  public getOrders(summaryid: string): Observable<ApiSearchResponse<LocalOrder, any>> {
    let params = new HttpParams()

    params = params.set('summaryorderid', summaryid)
    params = params.append('sort', 'recent')

    return this._http.get<ApiSearchResponse<LocalOrder, any>>(this.localorderurl, { params }).pipe(
      catchError(this._appService.handleError({data: [], totalCount: 0}))
    )
  }

  public getSummaryOrder(summaryid: string): Observable<ISummaryOrder | undefined> {
    return this._http.get<ISummaryOrder | undefined>(`${this.summaryrderurl}/${summaryid}`).pipe(
      catchError(this._appService.handleError(undefined))
    )
  }

  private orderErrorHandler(order: LocalOrder): any {
    return (error: any): Observable<any> => {

      if (error.error.code === 'InvalidContent') {
        if (error.error.message === 'POC_PRE_CLOSED')
          this._router.navigate([`conflict`], {
            queryParams: { stats: order.pocid }
          })

      }
      return of(null)
    }
  }

  public saveOrder(order: LocalOrder, location?: number): Observable<LocalOrder> {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    return this._http.post(this.localorderurl, {...order, location}, { headers }).pipe(
      catchError(this.orderErrorHandler(order)),
      map(response => response ? response : null)
    )
  }

  public updateOrder(order: LocalOrder, deltas: any, location?: number): Observable<any> {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })

    return this._http.put(`${this.localorderurl}/${order._id}`, {...deltas, location}, { headers })
    .pipe(
      catchError(this.orderErrorHandler(order)),
      map(response => response ? response : null)
    )
  }

  public changeSummaryOrderPocId(summaryorderid: string, pocid: string): Observable<boolean> {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })

    return this._http.put(`${this.summaryrderurl}/${summaryorderid}`, {pocid}, { headers })
    .pipe(
      catchError((error: any): Observable<any> => {
        
        if (error.error.code === 'InvalidContent') {
          if (error.error.message === 'CANNOT_CHANGE_ORDER')
            this._appService.log = 'Existem pedidos pendentes no ponto'
        }
        return of(false)
      }),
      map(response => response ? true : false)
    )
  }

  public closeOrder(orderId: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })

    const data: Partial<ISummaryOrder> = {
      pocstatus: SummaryOrderPocStatus.close_request
    }

    return this._http.put(`${this.summaryrderurl}/${orderId}`, data, { headers }).pipe(
      catchError(this._appService.handleError(null)),
      map(response => response ? response : null)
    )
  }

}