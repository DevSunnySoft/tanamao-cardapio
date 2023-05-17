import { Injectable } from '@angular/core'
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'
import { UsersService } from 'src/app/users/users.service'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private _usersService: UsersService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const exp = new RegExp(`${environment.servers_urls.main}/public/`)
    const exp2 = new RegExp(`${environment.servers_urls.images}/public/`)
    const exp4 = new RegExp(`${environment.servers_urls.main}`)

    let headers = request.headers

    const idx = request.url.search(exp)
    const idx2 = request.url.search(exp2)
    const idx4 = request.url.search(exp4)

    if(idx4 === 0) {
      headers = headers.set('api-version', '2')
      headers = headers.set('app-id', 'tnmapp')
    }

    if(
      (idx !== 0 ) &&
      (idx2 !== 0 ) &&
      (request.url !== `${environment.servers_urls.main}/auth`)
    ) {
      const authtoken = this._usersService.getToken()
      
      if(authtoken) {
        headers = headers.set('Authorization', `jwt ${authtoken}`)        
      }
    }

    return next.handle(request.clone({headers}))
  }
}
