import { isPlatformBrowser } from '@angular/common'
import { AfterViewInit, Directive, ElementRef, Inject, Input, PLATFORM_ID } from '@angular/core'
import { MatMenuDirective } from '../mat-menu/mat-menu.directive'

@Directive({
  selector: '[mat-button],[mat-icon-button]'
})
export class MatButtonDirective implements AfterViewInit {
  @Input() matMenuTriggerFor?: MatMenuDirective
  
  constructor(
    @Inject(PLATFORM_ID) platformId: any,
    private el: ElementRef<HTMLButtonElement>
  ) {
    if (isPlatformBrowser(platformId)) {
      if (el.nativeElement.getAttributeNames().includes('mat-icon-button'))
        el.nativeElement.classList.add('mat-icon-button')
      else
        el.nativeElement.classList.add('mat-button')
    }
  }

  ngAfterViewInit() {
    if (this.matMenuTriggerFor) {
      this.el.nativeElement.addEventListener('click', () => {
        
        if (this.matMenuTriggerFor)
          this.matMenuTriggerFor.show(this.el.nativeElement.clientWidth)
        
      })
    }
  }

}
