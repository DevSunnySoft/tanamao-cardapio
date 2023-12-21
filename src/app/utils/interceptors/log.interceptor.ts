import { Injectable } from '@angular/core'
import { EMPTY } from 'rxjs'
import { tap } from 'rxjs/operators'

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { AppService, TNetworkStatus } from 'src/app/app.service'

declare var navigator: any

@Injectable()
export class LogInterceptor implements HttpInterceptor {

  constructor(
    private _appService: AppService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let ok: string

    if (navigator.connection) {
      if (navigator.connection.downlink === 0) {
        this._appService.networkStatus = TNetworkStatus.offline
        return EMPTY
      }
      else
        if (navigator.connection.downlink <= 1)
          this._appService.networkStatus = TNetworkStatus.slow
        else
          this._appService.networkStatus = TNetworkStatus.fast
    }

    return next.handle(request).pipe(
      tap(
        (event: any) => ok = event instanceof HttpResponse ? 'succeeded' : '',
        (error: any) => {
          ok = 'failed'

          switch (error.status) {
            case 0:
              this._appService.networkStatus = TNetworkStatus.offline
              break
            case 404:
              console.log({ message: 'A página não existe', type: 'E' })
              break
          }
        },
        () => {
          if (ok === 'succedeed') { }
          this._appService.networkStatus = TNetworkStatus.fast
        }
      )
    )
  }
}
