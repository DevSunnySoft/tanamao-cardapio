import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, distinctUntilChanged, firstValueFrom, map, Observable, of, Subscription, take } from "rxjs";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { webSocket } from 'rxjs/webSocket';
import { RetryConfig } from 'rxjs/operators'
import { environment } from "src/environments/environment";
import { AppService } from "../app.service";
import IUser from "./user";
import { OrderService } from "../orders/order.service";

@Injectable({
  providedIn: "root"
})
export class UsersService {
  private _notificationSubscription?: Subscription
  private _userurl = `${environment.servers_urls.main}/users`
  private _publicurl = `${environment.servers_urls.main}/public/users`
  private _urlnotifications = `${environment.servers_urls.main}/notifications`

  constructor(
    private _router: Router,
    private _http: HttpClient,
    private _appService: AppService,
    private _orderService: OrderService
  ) { }

  private openWs(userid: string): void {
    
    if (!this._appService.ws) {
      const retryConfig: RetryConfig = {
        delay: 500,
        resetOnSuccess: true
      }
      const subject = webSocket(environment.servers_urls.ws)

      const obs = subject.multiplex(
        () => {
          console.log('Connecting')
          return {subscribe: userid}
        },
        () => {
          console.log('disconnecting')
          setTimeout(() => this.openWs(userid), 600)

          return {unsubscribe: userid}},
        (message: any) => true
      )

      if (this._appService.ws)
        this._appService.ws.unsubscribe()

      this._appService.ws = obs.subscribe((msg: any) => this.getUnreadNotifications(msg))
    }
  }

  private handleError<T>(result: T, showError = false) {
    return (error: HttpErrorResponse): Observable<T> => {
      return of(result as T);
    }
  }

  private subscribeToNotifications(): void {    
    this._notificationSubscription = this._appService.user$
      .pipe(distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)))
      .subscribe((data: IUser | undefined) => {
        if (data) {
          this.getUnreadNotifications()
          this.openWs(data._id)
        }
      })
  }

  private getUnreadNotifications(data?: any): void {
    this._appService.onnotificationchange.next({date: new Date(), data })
    /*
    let params = new HttpParams()
    params = params.set('unread', 'true')

    const sub = this._http.get<ApiSearchResponse<any, any>>(`${this._urlnotifications}`, { params }).pipe(
      take(1),
      catchError(this._appService.handleError(null))
    ).subscribe((response: ApiSearchResponse<INotification, any> | null) => {
      if (response)
        this._appService.notifications = response

      if (this._appService.onnotificationchange)
        this._appService.onnotificationchange.call([])

      sub.unsubscribe()
    })
    */
  }

  public getToken(): string | null {
    return this._appService.auth ? this._appService.auth.jwt.token : null
  }

  public getLogged(redirectto?: string): Observable<boolean> {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    if (!this._appService.auth) {
      
      if (redirectto)
        this._router.navigate([`sign`], {
          queryParams: {
            redirectto
          }
        })

      return of(false)
    } else {
      return this._http.get(`${this._userurl}/logged`, { headers }).pipe(
        take(1),
        catchError(this._appService.handleError<any>(undefined)),
        map((user: IUser) => {
          if (user) {
            this._appService.user = user
            
            if (user.localorder) {
              if (user.localorder.companyid !== this._appService.company!._id) {
                this._router.navigate([`conflict`], {
                  queryParams: { company: true }
                })

                  return false
              } else
              if (user.localorder.pocid !== this._appService.company!.pocid) {

                if (this._appService.changingQrCode) {
                  firstValueFrom(this._orderService.changeSummaryOrderPocId(user.localorder._id, this._appService.company!.pocid)).then(success => {
                    if (success)
                      this._appService.changingQrCode = false
                  })
                  
                } else
                  this._router.navigate([`conflict`], {
                    queryParams: { pocid: user.localorder.pocid }
                  })

                return false
              }
            }

            if (this._notificationSubscription)
              this._notificationSubscription.unsubscribe()

            this.subscribeToNotifications()

            return true

          }

          if (redirectto)
            this._router.navigate([`sign`], { queryParams: { redirectto } })

          return false
        })
      )
    }
  }

  public recovery(username: string): Observable<{ success: boolean, error?: any }> {
    const headers = { 'Content-type': `application/json` }

    return this._http.put(`${environment.servers_urls.main}/public/users/password`, { username }, { headers }).pipe(
      catchError((args: HttpErrorResponse): Observable<{ error: HttpErrorResponse }> => of({ error: args })),
      take(1),
      map(response => {
        if (response && 'error' in response)
          return { success: false, error: response.error }

        return { success: true }
      })
    )
  }

  public resetPassword(sessionid: string, password: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-type': 'application/json'
    })

    let params = new HttpParams()
    params = params.set('sessionid', sessionid)

    return this._http.put(`${this._publicurl}/reset`, { password }, { params, headers }).pipe(
      take(1),
      catchError((args: HttpErrorResponse): Observable<{ error: HttpErrorResponse }> => of({ error: args })),
      map(response => {
        if (response && 'error' in response)
          return { success: false, error: response.error }

        return { success: true }
      })
    )
  }

  public cepResearch(cep: string): Observable<any> {
    return this._http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).pipe(
      catchError(this._appService.handleError<any>(undefined))
    )
  }

  public login(username: string, password: string): Observable<{ success: boolean, error?: string }> {
    const credentials = btoa(`${username}:${password}`)
    const headers = {
      'Content-type': 'application/json',
      'Authorization': `Basic ${credentials}`
    }
    return this._http.post<any>(`${environment.servers_urls.main}/public/auth`, null, { headers }).pipe(
      catchError((args: HttpErrorResponse): Observable<{ error: HttpErrorResponse }> => of({ error: args })),
      take(1),
      map((response: any) => {
        if ('error' in response)
          return { success: false, error: response.error }

        this._appService.auth = { jwt: { token: response.token } }
        return { success: true }
      })
    )
  }

  public logout(): void {
    this._http.delete<any>(`${environment.servers_urls.main}/logout`).pipe(
      catchError(this._appService.handleError('error'))
    ).subscribe((response: any) => {
      this._appService.clearLoginData();
      this._router.navigate([`sign`]);
    })
  }

  public cadastre(name: string, password: string, confirmationId: string):Observable<{success: boolean, error?: HttpErrorResponse}> {
    const data = {name, password, confirmationId}
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })

    return this._http.post(`${environment.servers_urls.main}/public/users`, data, {headers}).pipe(
      catchError((args: HttpErrorResponse): Observable<{error: HttpErrorResponse}> => of({error: args})),
      take(1),
      map(response => ('error' in response ) ? { success: false, error: response.error} : {success: true })
    )
  }

  public createTemporaryUser(name: string, phone: string):Observable<{success: boolean, error?: HttpErrorResponse}> {
    const data = {name, phone}
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })

    return this._http.post(`${environment.servers_urls.main}/public/users/temporary`, data, {headers}).pipe(
      catchError((args: HttpErrorResponse): Observable<{error: HttpErrorResponse}> => of({error: args})),
      take(1),
      map((response: any) => {
        if ('error' in response)
          return { success: false, error: response.error }

        this._appService.auth = { jwt: { token: response.token } }
        return { success: true }
      })
    )
  }

  public update(deltas: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-type': 'application/json'
    })

    return this._http.put(`${this._userurl}`, deltas, { headers }).pipe(
      take(1),
      catchError(this._appService.handleError(undefined)),
      map(response => {
        return response
      })
    )
  }

  public markNotificationsAsRead(): Observable<boolean> {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    let params = new HttpParams()

    params = params.set('unread', 'true')

    return this._http.put<boolean>(`${this._urlnotifications}`, { $set: { read: true } }, { headers, params }).pipe(
      take(1),
      catchError(this._appService.handleError(false)),
      map(response => response ? true : false)
    )
  }

  
  public validatePhone(phone: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('phone', phone);
    
    return this._http.get(`${environment.servers_urls.main}/public/users/phonevalidation`, {params})
      .pipe(catchError(this.handleError(null)));
  }

  public getConfirmation(confirmationId: string): Observable<any> {
    return this._http.get(`${environment.servers_urls.main}/public/users/phonevalidation/${confirmationId}`)
      .pipe(catchError(this.handleError(null)));
  }

  public validatePhoneCode(confirmationId: string, code: string): Observable<any> {
    let params = new HttpParams()
    params = params.set('code', code);

    return this._http.get(`${environment.servers_urls.main}/public/users/codeverification/${confirmationId}`, { params })
      .pipe(catchError(this.handleError(false)));
  }

  public createUserConfirmation(phone: string, userToConfirm: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-type', 'application/json');
    
    const data = {
      phone,
      userId: userToConfirm === "new" ? undefined : userToConfirm
    }
    return this._http.post(`${environment.servers_urls.main}/public/users/phonevalidation`, data, {headers})
      .pipe(catchError(this.handleError(null)));
  }

  public retryUserConfirmation(confirmationId: string): Observable<any> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-type', 'application/json');
    return this._http.post(`${environment.servers_urls.main}/public/users/phonevalidation/${confirmationId}`, null, {headers})
      .pipe(catchError(this.handleError(null)));
  }
}