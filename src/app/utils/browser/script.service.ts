import { isPlatformBrowser } from '@angular/common'
import { Inject, Injectable, PLATFORM_ID } from '@angular/core'

const scripts = [
  { name: 'facebookSDK', src: 'https://connect.facebook.net/pt_BR/sdk.js' },
  { name: 'googleAPI', src: 'https://accounts.google.com/gsi/client' },
  { name: 'herecore', src: 'https://js.api.here.com/v3/3.1/mapsjs-core.js', charset: "utf-8" },
  { name: 'hereservice', src: 'https://js.api.here.com/v3/3.1/mapsjs-service.js', charset: "utf-8" },
]


@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private scripts: {[key: string]: any} = {}

  constructor(
    @Inject(PLATFORM_ID) private platformid: Object
  ) {
    for(let key in scripts) {
      const script = scripts[key]

      this.scripts[script.name] = {
        isloaded: false,
        src: script.src
      }
    }
  }

  private _loadScript(name: string) {
    return new Promise((resolve, reject) => {
      if( this.scripts[name].isloaded === true ) {
        resolve({ script: name, loaded: true, status: 'Already Loaded'})
      } else {
        if (window && isPlatformBrowser(this.platformid) ) {

          const script: any = window.document.createElement('script')
          script.type = 'text/javascript'
          script.src = this.scripts[name].src

          if (this.scripts[name].charset)
            script.charset = this.scripts[name].charset
            
          //script.crossOrigin = 'anonymous'
          script.async = true
          script.defer = true

          if(script.readyState) {//IE
            script.onreadystatechange = () => {
              if( script.readyState === 'loaded' || script.readyState === 'complete') {
                script.onreadystatechange = null
                this.scripts['name'].loaded = true
                resolve({script: name, loaded: true, status: 'Loaded'})
              }
            }
          } else {
            script.onload = () => {
              this.scripts[name].loaded = true
              resolve({script: name, loaded: true, status: 'Loaded'})
            }
          }

          script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
          window.document.getElementsByTagName('head')[0].appendChild(script)

        }
      }
    })
  }

  load(...scripts: string[]) {
    const promises: any[] = []
    scripts.forEach(script => promises.push(this._loadScript(script)))
    return Promise.all(promises)
  }
}
