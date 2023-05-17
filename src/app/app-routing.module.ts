import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './catalog/catalog.component';
import { BasketComponent } from './orders/basket/basket.component';
import { CheckoutComponent } from './orders/checkout/checkout.component';
import { CloseComponent } from './orders/close/close.component';
import { ConflictComponent } from './orders/conflict/conflict.component';
import { LocalOrderComponent } from './orders/local-orders/local-order.component';
import { SummaryOrderComponent } from './orders/summary-order/summary-order.component';
import { OrderSelectorComponent } from './products/order-selector/order-selector.component';
import { ProductDetailComponent } from './products/product-details/product-details.component';
import { ScannerComponent } from './scanner/scanner.component';
import { LogoutComponent } from './users/logout/logout.component';
import { AuthGuard } from './utils/guards/auth.guard';
import { CompanyGuard } from './utils/guards/company.guard';
import { NoAuthGuard } from './utils/guards/no-auth.guard';
import { SignComponent } from './users/sign/sign.component';

const routes: Routes = [
  {
    path: "",
    component: CatalogComponent,
    canActivate: [CompanyGuard]
  },
  {
    path: "scanner",
    component: ScannerComponent
  },
  {
    path: "preferences",
    canActivate: [CompanyGuard],
    component: OrderSelectorComponent,
    pathMatch: "full"
  },
  {
    path: "basket",
    canActivate: [CompanyGuard],
    component: BasketComponent,
    pathMatch: "full"
  },
  {
    path: "summary",
    canActivate: [CompanyGuard, AuthGuard],
    component: SummaryOrderComponent,
    pathMatch: "full"
  },
  {
    path: "checkout",
    canActivate: [CompanyGuard, AuthGuard],
    component: CheckoutComponent
  },
  {
    path: 'order',
    canActivate: [CompanyGuard, AuthGuard],
    component: LocalOrderComponent
  },
  {
    path: 'me',
    canActivate: [AuthGuard],
    loadChildren: () => import('./users/user.module').then(m => m.UserModule)
  },
  {
    path: 'sign',
    component: SignComponent,
    canActivate: [NoAuthGuard],
    pathMatch: "full"
  },
  {
    path: 'conflict',
    component: ConflictComponent,
    pathMatch: "full"
  },
  {
    path: 'logout',
    component: LogoutComponent,
    pathMatch: "full"
  },
  {
    path: 'close',
    component: CloseComponent,
    canActivate: [CompanyGuard, AuthGuard],
    pathMatch: "full"
  },
  {
    path: "product/:productid",
    canActivate: [CompanyGuard],
    component: ProductDetailComponent
  },

  {
    path: ":qrcode",
    component: CatalogComponent,
    canActivate: [CompanyGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
