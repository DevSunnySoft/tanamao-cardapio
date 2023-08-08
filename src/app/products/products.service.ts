import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppService } from '../app.service';
import { ApiSearchResponse } from '../utils/global';
import { IProduct, IProductCategory, IProductSettings, IProductSettingsAdditional, IProductsSearchQuery, OrderType, TCategoryType } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private readonly productSettingsUrl = `${environment.servers_urls.main}/public/productssettings`
  private readonly productUrl = `${environment.servers_urls.main}/public/products`
  private readonly categoryUrl = `${environment.servers_urls.main}/public/categories`

  constructor(
    private _http: HttpClient,
    private _appService: AppService
  ) { }

  // private

  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T);
    }
  }

  // public
  getProducts(args: any): Observable<ApiSearchResponse<IProduct, IProductsSearchQuery>> {
    if (this._appService.company) {
      const url = `${this.productUrl}/${this._appService.company._id}`
      let params = new HttpParams

      for (let key in args) {
        if (typeof args[key] !== 'undefined')
          params = params.append(key, String(args[key]))
      }

      console.log(params);

      return this._http.get<ApiSearchResponse<IProduct, IProductsSearchQuery>>(url, { params }).pipe(
        take(1),
        catchError(this.handleError<ApiSearchResponse<IProduct, IProductsSearchQuery>>({ totalCount: 0, data: [] }))
      )
    } else
      return of({ data: [], totalCount: 0 })
  }

  getProductSettingsById(id: string): Observable<IProductSettings> {
    if (this._appService.company) {
      const url = `${this.productSettingsUrl}/${this._appService.company._id}/${id}`
      let params = new HttpParams()
      params = params.set('businesstype', 'retail')

      return this._http.get<any>(url, { params }).pipe(catchError(this.handleError<IProductSettings>()))
    } else
      return of()
  }

  getProductsSettingsByIds(ids: string, fields: Array<string>): Observable<IProductSettings> {
    if (this._appService.company) {
      const url = `${this.productSettingsUrl}/${this._appService.company._id}/${ids}`
      let params = new HttpParams

      fields.forEach((field: string) => params = params.append('fields[]', field))

      return this._http.get<IProductSettings>(url, { params }).pipe(
        take(1),
        catchError(this.handleError<IProductSettings>(undefined))
      )
    } else
      return EMPTY
  }

  getProductsSettingsByIdsAdditionals(ids: string): Observable<IProductSettingsAdditional[]> {
    if( this._appService.company ) {
      const url = `${environment.servers_urls.main}/public/productssettings/${this._appService.company._id}/${ids}/additionals`
      let params = new HttpParams

      params = params.append('ordertype', OrderType.local)

      return this._http.get<IProductSettingsAdditional[]>(url, {params}).pipe(
        take(1),
        catchError(this.handleError<IProductSettingsAdditional[]>([]))
      )
    } else
      return EMPTY
  }

  getCategories(categoryType?: TCategoryType): Observable<Array<IProductCategory>> {
    if (this._appService.company) {
      const url = `${this.categoryUrl}/${this._appService.company._id}`
      let params = new HttpParams()

      params = params.set('islocalactive', true)

      if (categoryType)
        params = params.append('categorytype', categoryType)

      if (this._appService.company.catalogindex >= 0 && this._appService.company.isopened)
        params = params.append('catalogandnull[]', this._appService.company.catalogindex);

      return this._http.get<ApiSearchResponse<IProductCategory, any>>(`${url}`, { params }).pipe(
        take(1),
        catchError(this.handleError<any>([])),
        map((response: ApiSearchResponse<IProductCategory, any>) => response.data)
      )
    } else
      return of([])
  }

  getCategoryById(categoryid: string): Observable<IProductCategory> {
    if (this._appService.company) {
      const url = `${this.categoryUrl}/${this._appService.company._id}/${categoryid}`
      return this._http.get<IProductCategory>(url).pipe(
        take(1),
        catchError(this.handleError<IProductCategory>())
      )
    } else
      return of()
  }

  getProductById(id: string): Observable<IProduct> {
    if (this._appService.company) {
      const url = `${this.productUrl}/${this._appService.company._id}/${id}`
      let params = new HttpParams()
      params = params.set('businesstype', 'retail')

      return this._http.get<any>(url, { params }).pipe(
        take(1),
        catchError(this.handleError<IProduct>(undefined))
      )
    } else
      return EMPTY
  }
}
