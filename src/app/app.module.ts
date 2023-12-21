import { NgModule } from '@angular/core';
import { BrowserModule, HammerGestureConfig, } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import localePt from '@angular/common/locales/pt';

import { AppComponent } from './app.component';
import { CatalogComponent } from './catalog/catalog.component';
import { ScanComponent } from './scanner/scan/scan.component';
import { ScannerComponent } from './scanner/scanner.component';
import { ImgLazyDirective } from './utils/browser/img-lazy.directive';
import { MatMenuModule } from './material/mat-menu/mat-menu.module';
import { CategoriesListComponents } from './catalog/categories/categories.component';
import { HammerConfig } from './utils/browser/HammerConfig';
import { httpInterceptorProviders } from './utils/interceptors';
import { CurrencyPipe, DatePipe, registerLocaleData, TitleCasePipe } from '@angular/common';
import { ProductDetailComponent } from './products/product-details/product-details.component';
import { MatAccordionModule } from './material/mat-accordion/mat-accordion.module';
import { OrderSelectorComponent } from './products/order-selector/order-selector.component';
import { MatRadioModule } from './material/mat-radio/mat-radio.module';
import { MatDialogModule } from './material/mat-dialog/mat-dialog.module';
import { MatBadgeModule } from './material/mat-badge/mat-badge.module';
import { MatQtdSelectorModule } from './material/mat-qtd-selector/mat-qtd-selector.module';
import { AdditionalListComponent } from './products/additional-list/addition-list.component';
import { BasketComponent } from './orders/basket/basket.component';
import { BasketItemsComponent } from './orders/basket/basket-items/basket-items.component';
import { MatButtonModule } from './material/mat-button/mat-button.module';
import { SummaryOrderComponent } from './orders/summary-order/summary-order.component';
import { OrderAlertComponent } from './orders/alert/order-alert.component';
import { LocalOrderComponent } from './orders/local-orders/local-order.component';
import { CheckoutComponent } from './orders/checkout/checkout.component';
import { MatLabelModule } from './material/mat-label/mat-label.module';
import { MatFormFieldModule } from './material/mat-form-field/mat-form-field.module';
import { MatInputModule } from './material/mat-input/mat-input.module';
import { ConflictComponent } from './orders/conflict/conflict.component';
import { LogoutComponent } from './users/logout/logout.component';
import { CloseComponent } from './orders/close/close.component';
import { OrderDetailComponent } from './orders/local-orders/details/order-detail.component';
import { LocationComponent } from './orders/checkout/location/location.component';
import { SignComponent } from './users/sign/sign.component';
import { MatMaskModule } from './material/mat-mask/mat-mask.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from 'src/environments/environment';

registerLocaleData(localePt);

@NgModule({
  declarations: [
    AppComponent,
    CatalogComponent,
    ScannerComponent,
    ScanComponent,
    ImgLazyDirective,
    CategoriesListComponents,
    ProductDetailComponent,
    OrderSelectorComponent,
    AdditionalListComponent,
    OrderDetailComponent,
    BasketComponent,
    BasketItemsComponent,
    SummaryOrderComponent,
    OrderAlertComponent,
    LocalOrderComponent,
    CheckoutComponent,
    SignComponent,
    LogoutComponent,
    ConflictComponent,
    CloseComponent,
    LocationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatAccordionModule,
    MatRadioModule,
    MatDialogModule,
    MatBadgeModule,
    MatButtonModule,
    MatQtdSelectorModule,
    MatFormFieldModule,
    MatInputModule,
    MatLabelModule,
    MatMaskModule,
    ServiceWorkerModule.register('custom-service-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    TitleCasePipe,
    DatePipe,
    CurrencyPipe,
    httpInterceptorProviders,
    {
      provide: HammerGestureConfig,
      useClass: HammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
