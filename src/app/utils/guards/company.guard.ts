import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { map, Observable, of, tap } from "rxjs";
import { CompaniesService } from "src/app/companies/companies.service";
import { OrderService } from "src/app/orders/order.service";

@Injectable({
  providedIn: "root"
})
export class CompanyGuard implements CanActivate {
  
  constructor(
    private _orderService: OrderService,
    private _companiesService: CompaniesService,
    private _router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (!this._orderService.scanHash) {
      this._router.navigate(['scanner'])
      
      return of(false)
    }

    const filter = {scanhash: this._orderService.scanHash}
    return this._companiesService.companyGuard(filter).pipe(
      tap(value => {
        if (!value)
          this._orderService.scanHash = null
      })
    )
  }
}