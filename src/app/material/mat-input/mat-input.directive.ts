import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core'
import { NgControl } from '@angular/forms'

@Directive({
  selector: '[matInput]'
})
export class MatInputDirective {
  private focused = false

  @Input() placeholder: string = ''
  @Output() detectStatusChanges: EventEmitter<any> = new EventEmitter()
  @Output() onBlur: EventEmitter<any> = new EventEmitter()
  @Output() onFocus: EventEmitter<any> = new EventEmitter()

  constructor(public el: ElementRef<HTMLInputElement>, public control: NgControl) {
    el.nativeElement.className += ` mat-input`
    el.nativeElement.placeholder = ''

    this.control.statusChanges?.subscribe(value => { })
  }

  private changeStatus() {
    this.detectStatusChanges.emit(this.control)
  }

  ngAfterViewInit() {
    this.control.statusChanges?.subscribe(() => this.changeStatus())
    this.changeStatus()
  }

  @HostListener('blur', ['$event'])
  _onBlur(ev: any) {
    if (!this.el.nativeElement.value || (this.el.nativeElement.value && this.el.nativeElement.value.length < 0))
      this.el.nativeElement.placeholder = this.placeholder
    this.focused = false
    this.changeStatus()
    this.onBlur.emit(ev)
  }

  @HostListener('focus', ['$event'])
  _onFocus(ev: any) {
    this.focused = true
    this.onFocus.emit(ev)
  }

  @HostListener('window:resize', ['$event']) onResize(ev: any) {

    if (this.focused && window) {
      const scrollTop = ev.currentTarget.scrollY
      const height = ev.currentTarget.innerHeight
      const elementTop = this.el.nativeElement.getBoundingClientRect().top
      const elementHeight = this.el.nativeElement.clientHeight

      if ((elementTop < scrollTop) || ((elementTop + elementHeight) > scrollTop + height))
        window.document.getElementById('app-book')?.scrollTo({top: elementTop, behavior: 'smooth'})
    }
  }
}
