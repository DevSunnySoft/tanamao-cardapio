import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { AppService } from "src/app/app.service";
import { OrderOdsService } from "src/app/orders/order.ods.service";

@Injectable({
  providedIn: "root"
})
export class NoOrderGuard implements CanActivate {

  constructor(
    private _appService: AppService,
    private _orderOds: OrderOdsService,
    private _router: Router
  ) {}

  canActivate(): boolean {
    const isCreated = this._orderOds.isCreated
    
    if (!isCreated)
      this._router.navigate([``])

    return isCreated
  }
  
}