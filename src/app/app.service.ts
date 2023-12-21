import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, NgZone, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, Observable, of, ReplaySubject, Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import { ICompany } from "./companies/company";
import IUser, { IAuth, INotification } from "./users/user";
import { ApiSearchResponse } from "./utils/global";

export enum TNetworkStatus {
  slow,
  fast,
  offline
}

@Injectable({
  providedIn: "root"
})
export class AppService {
  private logTimer?: any
  private _company: ICompany | undefined
  private _log: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null)
  private _networkStatus: ReplaySubject<TNetworkStatus> = new ReplaySubject(1)
  private _notifications: ReplaySubject<ApiSearchResponse<INotification, any>> = new ReplaySubject(1)
  private _user: ReplaySubject<IUser|undefined> = new ReplaySubject(1)
  private _auth?: IAuth

  public ws: any
  public onnotificationchange: ReplaySubject<any> = new ReplaySubject(1)
  private _changingQrCode = false

  public readonly notifications$: Observable<ApiSearchResponse<INotification, any>> = this._notifications.asObservable()
  public readonly networkStatus$ = this._networkStatus.asObservable()
  public readonly user$: Observable<IUser | undefined> = this._user.asObservable()
  public readonly log$ = this._log.asObservable()
  
  get changingQrCode(): boolean {
    if (!this._changingQrCode && window) {
      const stored_info = window.sessionStorage.getItem('_changingqr')

      if (stored_info) {
        try {
          this._changingQrCode = JSON.parse(stored_info)
        } catch (e) { }
      }
    }

    return this._changingQrCode
  }

  set changingQrCode(value: boolean) {
    if (window) {
      window.sessionStorage.setItem('_changingqr', JSON.stringify(value))
      this._changingQrCode = value
    }
  }

  set company(value: ICompany | undefined) {
    if (value && window) {
      window.sessionStorage.setItem('_LC', JSON.stringify(value))
      this._company = value
    }
  }

  get company(): ICompany | undefined {
    if (!this._company && window) {
      const stored_company = window.sessionStorage.getItem('_LC')

      if (stored_company) {
        try {
          this._company = JSON.parse(stored_company)
        } catch (e) { }
      }
    }

    return this._company
  }

  set notifications(value: ApiSearchResponse<INotification, any>) {
    this._notifications.next(value)
  }

  set log(value: string | null) {
    if (this.logTimer)
      this.logTimer = undefined
      
    this._log.next(value)
    this.logTimer = setTimeout(() => this._log.next(null), 3000)
  }

  set user(value: IUser | undefined) {
    this._user.next(value)
  }

  set networkStatus(value: TNetworkStatus) {
    this._networkStatus.next(value)
  }

  get auth(): IAuth | undefined {
    if (!this._auth && window) {
      let storage: string | null = null
      storage = window.localStorage.getItem('_A2')

      if (storage) {
        try {
          const data = JSON.parse(atob(storage))
          this._auth = data
        } catch(e) {}
      }
    }

    return this._auth
  }
  
  set auth(value: IAuth | undefined) {
    this._auth = value
    if (window)
      window.localStorage.setItem('_A2', btoa((JSON.stringify(this._auth))))
  }
  
  public readonly isBrowser = isPlatformBrowser(this._platfotmId)

  constructor(
    private _zone: NgZone,
    @Inject(DOCUMENT) private _document: Document,
    @Inject(PLATFORM_ID) private _platfotmId: string
  ) {}

  public detachElement(message: string, id: string): void {
    this._zone.runOutsideAngular(() => {
      const element = this._document.getElementById(id)

      const fn = () => {
        if(element) {
          element.classList.remove('detach')
          element.removeEventListener('click', fn)
        }
      }

      if( element && window ) {
        window.document.getElementById('app-book')?.scrollTo({
          top: element.offsetTop - 50, 
          behavior: 'smooth'
        })

        element.classList.add('detach')
        element.setAttribute('data-detach', message)
        element.addEventListener('click', fn)
      }
    })
  }

  public getMiniatureImage(urilogo: string): string {
    return `${environment.servers_urls.images}/100x100/${urilogo}`
  }

  public getOriginalImage(urilogo: string): string {
    return `${environment.servers_urls.images}/original/${urilogo}`
  }

  public getMediumImages(urilogo: string): string {
    return `${environment.servers_urls.images}/380x380/${urilogo}`
  }

  public handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      return of(result as T)
    }
  }

  public clearLoginData() {
    this.user = undefined
    this.auth = undefined

    if (window)
      window.localStorage.removeItem(`_A`)

    if (this.ws)
      this.ws.unsubscribe();
  }

}