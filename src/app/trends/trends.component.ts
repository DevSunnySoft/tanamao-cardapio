import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from '../app.service';
import { IProduct, IProductSettingsComponent } from '../products/product';
import { ProductsService } from '../products/products.service';
import { firstValueFrom } from 'rxjs';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.sass']
})
export class TrendsComponent implements OnInit {
  readonly company = this._appService.company
  product!: IProduct | null
  components: IProductSettingsComponent[] = []

  constructor(
    private _route: ActivatedRoute,
    private _productsService: ProductsService,
    private _appService: AppService,
    private _router: Router,
    private titleCase: TitleCasePipe
  ) {}

  private async productSettings(productsettingsid: string) {
    const settings = await firstValueFrom(
      this._productsService.getProductsSettingsByIds(productsettingsid, ['components', 'obs'])
    )
    this.components = settings.components.filter(item => item.data.length > 1)
  }

  private getProductInfo(productid: string | null): void {
    if( productid ) {
      const sub = this._productsService.getProductById(productid).subscribe((product: IProduct) => {
        this.product = product
        Promise.resolve(this.productSettings(this.product.productsettingsid))
        
        sub.unsubscribe()
      })
    }
  }

  componentText(component: IProductSettingsComponent) {
    let response = component.data.map(item => this.titleCase.transform(item.product.product))
    return response.join(', ')
  }

  getCompanyImages(uri: string): string {
    return this._appService.getMiniatureImage(uri)
  }

  loadImage(images: Array<string>, size: string): string {
    if(images && images.length) {
      return this._appService.getMediumImages(images[0])
    } else
      return ''
  }

  onClickBack() {
    if(window && window.history)
      window.history.back()
    else
      this._router.navigate(['../'])
  }

  ngOnInit(): void {
    this.getProductInfo(this._route.snapshot.paramMap.get('id'))
  }
}
