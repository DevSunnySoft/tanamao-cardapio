import { DOCUMENT } from '@angular/common';
import { AfterContentInit, ContentChild, Directive, ElementRef, Inject, OnDestroy } from '@angular/core'
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatInputDirective } from '../mat-input/mat-input.directive';
import { MatLabelDirective } from '../mat-label/mat-label.directive';
import { MatPrefixDirective } from './mat-prefix.directive';
import { MatSuffixDirective } from './mat-suffix.directive';

@Directive({
  selector: 'mat-form-field'
})
export class MatFormFieldDirective implements OnDestroy, AfterContentInit {
  @ContentChild(MatLabelDirective) label!: MatLabelDirective
  @ContentChild(MatInputDirective) control!: MatInputDirective
  @ContentChild(MatPrefixDirective) prefix!: MatPrefixDirective
  @ContentChild(MatSuffixDirective) suffix!: MatSuffixDirective

  private _subscriptions: Array<Subscription> = []

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private el: ElementRef<HTMLElement>
  ) { }

  ngAfterContentInit() {
    if (this.control && this.label) {

      this._subscriptions.push(
        this.control.detectStatusChanges.subscribe((el: NgControl) => {
          if (el.touched) {
            this.el.nativeElement.classList.add('ng-touched')

            if (el.invalid) {
              this.el.nativeElement.classList.add('ng-invalid')
              this.el.nativeElement.classList.remove('ng-valid')
            } else {
              this.el.nativeElement.classList.add('ng-valid')
              this.el.nativeElement.classList.remove('ng-invalid')
            }
          }

          if (el.control && el.control.value && String(el.control.value).length > 0)
            this.label.el.nativeElement.classList.add('elevate')
          else
            this.label.el.nativeElement.classList.remove('elevate')
        })
      )

      this._subscriptions.push(
        this.control.onFocus.subscribe(() => {
          const domRect = this.control.el.nativeElement.getBoundingClientRect()
         // this._document.getElementById('app-book')!.scrollTo({top: domRect.top, behavior: 'smooth'})
          this.label.el.nativeElement.classList.add('elevate')
        })
      )

      if (this.control.control.value && String(this.control.control.value).length > 0)
        this.label.el.nativeElement.classList.add('elevate')
    }

    this.el.nativeElement.className = 'mat-form-field'
  }

  ngOnDestroy() {
    this._subscriptions.forEach(item => item.unsubscribe())
  }
}
