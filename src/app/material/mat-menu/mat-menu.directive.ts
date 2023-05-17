import { ContentChild, Directive, ElementRef, EventEmitter, Inject, Input, Output, PLATFORM_ID, TemplateRef, ViewContainerRef } from '@angular/core'
import { DOCUMENT, isPlatformBrowser } from '@angular/common'

@Directive({
  selector: '[matMenuContent]'
})
export class MatMenuContentDirective {

  constructor(
    private vc: ViewContainerRef,
    private t: TemplateRef<any>
  ) {}

  create() {
    this.vc.clear()
    const v = this.t.createEmbeddedView({})
    this.vc.insert(v)
  }

  remove() {
    this.vc.clear()
  }

}

@Directive({
  selector: 'mat-menu',
  exportAs: 'matMenu'
})
export class MatMenuDirective {
  @ContentChild(MatMenuContentDirective, { static: false }) content?: MatMenuContentDirective
  @Input() position: 'before' | 'after' = 'before'
  @Output() onShow: EventEmitter<void> = new EventEmitter()

  private bg?: HTMLElement

  constructor(
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.el.nativeElement.className = `mat-menu mat-hide`
    this.el.nativeElement.addEventListener('click', (e: any) => e.stopPropagation())
  }

  public show(x: number = 50, y: number = 0, w: number = 0, bgaction: boolean = true) {
    if(!this.bg && window) {
      this.content?.create()
      
      this.el.nativeElement.classList.add(this.position)
      this.el.nativeElement.classList.remove('mat-hide')
      this.el.nativeElement.classList.add('mat-display')

      this.bg = this.document.createElement('div')
      this.bg.className = 'mat-bg'

      if( bgaction )
        this.bg.addEventListener('click', () => this.close())
      
      this.document.getElementById('app-book')!.prepend(this.bg)
      
      if (isPlatformBrowser(this.platformId) && window && window.innerWidth > 800) {
        if ((window.innerHeight / 4) * 3 < this.el.nativeElement.offsetTop) {
          y = 0
          this.el.nativeElement.style.transformOrigin = 'right bottom'
          this.el.nativeElement.style.bottom = `${window.innerHeight - this.el.nativeElement.offsetTop + 46}px`
        }
      }

      if(y)
        this.el.nativeElement.style.marginTop = `${y}px`

      if(w)
        this.el.nativeElement.style.width = `${w}px`

      if( this.position == 'before' ) {
        if(x)
          this.el.nativeElement.style.marginLeft = `-${this.el.nativeElement.offsetWidth-x}px`
      }
      else if(x) {
        if (window) {
          let dif = window.innerWidth - (this.el.nativeElement.offsetWidth + x)

          if (dif < 0)
            x += dif - 10 
        }

        this.el.nativeElement.style.marginLeft = `${x}px`
      }

      this.onShow.emit()
    }
  }

  public close() {
    if (this.bg) {
      this.document.getElementById('app-book')!.removeChild(this.bg)
      delete this.bg
    }

    this.el.nativeElement.classList.remove('mat-display')
    this.el.nativeElement.classList.add('mat-hide')
    
    if(this.content)
      this.content?.remove()
  }
}