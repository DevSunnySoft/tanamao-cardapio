import { DOCUMENT } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { catchError, map, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AppService } from "../app.service";
import { OrderSelectorOdsService } from "../catalog/order-selector.ods.service";
import { OrderOdsService } from "../orders/order.ods.service";
import { ICompany } from "./company";

@Injectable({
  providedIn: "root"
})
export class CompaniesService {
  private _urlcompanies = `${environment.servers_urls.main}/public/companies`

  constructor(
    private _appService: AppService,
    private _http: HttpClient,
    private _orderOdservice: OrderOdsService,
    private _orderSelectorOds: OrderSelectorOdsService,
    @Inject(DOCUMENT) private _document: Document
  ) {}

  public companyGuard(filter: any): Observable<boolean> {
    let params = new HttpParams()

    for (let key in filter)
      params = params.append(key, String(filter[key]))

    return this._http.get<ICompany>(`${this._urlcompanies}/first`, { params })
      .pipe(
        catchError(this._appService.handleError<any>(false)),
        map((response: ICompany | undefined) => {
          if (response) {
            this._appService.company = response
            this._document.documentElement.style.setProperty('--company-color', response.stylecolor || '#111111')

            this._orderOdservice.retrieveOrder()
            if (this._orderOdservice.isCreated)
              this._orderOdservice.changePoc(response.pocid, response.poctype)
            this._orderSelectorOds.clear()

            return true
          }
          
          return false
        })
      )
  }

}