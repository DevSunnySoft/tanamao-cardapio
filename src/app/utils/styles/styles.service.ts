import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, NgZone, PLATFORM_ID } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class StyleService {
  
  themes_list: any = {
    "mat-radio": "./mat-radio-style.css",
    "mat-menu": "./mat-menu-style.css",
    "mat-form-field": "./mat-form-field-style.css",
    "mat-dialog": "./mat-dialog-style.css"
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformid: Object,
    private _zone: NgZone
  ) {}

  loadStyle(styleName: string) {
    if (isPlatformBrowser(this.platformid) ) {
      this._zone.runOutsideAngular(() => {

        const head = this.document.getElementsByTagName('head')[0]

        if (!document.getElementById(styleName) ) {
          const style: HTMLLinkElement = this.document.createElement('link')
          style.id = styleName
          style.rel = 'stylesheet'
          style.href = this.themes_list[styleName]

          head.appendChild(style)      
        }

      })
    }    
  }
}