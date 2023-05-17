import { isPlatformBrowser } from "@angular/common"
import { ChangeDetectorRef, Directive, ElementRef, HostBinding, Inject, Input, NgZone, PLATFORM_ID } from "@angular/core"

@Directive({
  selector: '[appImgLazy]'
})
export class ImgLazyDirective {
  @HostBinding('attr.src') srcAttr: string | null = null
  @Input('zoomed') zoomed?: string
  @Input() src: string = ''

  constructor(
    private _el: ElementRef,
    private _zone: NgZone,
    private _cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformid: Object
  ) {}

  // private
  private canLazyLoad(): any {
    return window && isPlatformBrowser(this.platformid) && window && 'IntersectionObserver' in window
  }

  private lazyLoadImage(): void {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting }) => {

        if (isIntersecting) {
          this.loadImage()
          obs.unobserve(this._el.nativeElement)
        }
        
      })
    })

    obs.observe(this._el.nativeElement)
  }

  private loadImage(): void {
    this.srcAttr = this.src
    this._cdr.detectChanges()    
  }

  private setZoomClick() {
    this._el.nativeElement.addEventListener('click', () => {

      if (this.zoomed) {
        this._zone.runOutsideAngular(() => {

          const zoomelement: HTMLDivElement = document.createElement('div')
          zoomelement.addEventListener('click', (ev: Event) => {
            ev.stopPropagation()
            ev.preventDefault()

            document.body.removeChild(zoomelement)
          })
          zoomelement.style.backgroundColor = 'rgba(0,0,0,.5)'
          zoomelement.style.zIndex = '999'
          zoomelement.style.position = 'fixed'
          zoomelement.style.top = '0'
          zoomelement.style.left = '0'
          zoomelement.style.width = '100vw'
          zoomelement.style.height = '100vh'
          zoomelement.style.textAlign = 'center'
          zoomelement.style.lineHeight = '100vh'
          zoomelement.style.verticalAlign = 'middle'
          
          const zoomx: HTMLButtonElement = document.createElement('button')
          zoomx.style.float = 'right'
          zoomx.style.width = '40px'
          zoomx.style.fontFamily = `'Material icons'`
          zoomx.style.fontSize = '25px'
          zoomx.style.color = '#ffffff'
          zoomx.style.cursor = 'pointer'
          zoomx.style.border = 'none'
          zoomx.style.backgroundColor = 'transparent'
          zoomx.style.outline = 'none'
          zoomx.addEventListener('click', (ev: Event) => {
            ev.stopPropagation()
            ev.preventDefault()

            document.body.removeChild(zoomelement)
          })

          zoomx.innerHTML = 'close'
          
          if (this.zoomed) {
            const zoomimg: HTMLImageElement = document.createElement('img')
            
            zoomimg.src = this.zoomed
            //zoomimg.style.backgroundImage = `url(assets/icons/asset_3.gif)`
            zoomimg.style.backgroundRepeat = 'no-repeat'
            zoomimg.style.backgroundPosition = 'center'
            zoomimg.style.maxWidth = '380px'
            zoomimg.style.maxHeight = '380px'

            zoomimg.addEventListener('click', (ev: Event) => {
              ev.stopPropagation()
              ev.preventDefault()
            })

            zoomelement.append(zoomx, zoomimg)
            document.body.append(zoomelement)
          }

        })
      }
      
    })
  }

  ngAfterViewInit() {
    this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage()

    if( this.zoomed )
      this.setZoomClick()
  }
}