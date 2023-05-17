import { AfterViewInit, Directive, ElementRef, Input } from "@angular/core";

@Directive({
  selector: 'mat-radio-button'
})
export class MatRadioDirective implements AfterViewInit {
  @Input() caption: string = ''
  @Input() value: any = ''

  constructor(
    public el: ElementRef<HTMLElement>
  ) {}

  onChange = (el: any) => {}

  registerOnChange(onChange: any): void {
    this.onChange = onChange
  }

  ngAfterViewInit(): void {
    const dot_radio: HTMLSpanElement = document.createElement('span')
    dot_radio.classList.add('dot-radio-button')

    const span_radio: HTMLSpanElement = document.createElement('span')
    span_radio.classList.add('mat-radio-button')
    span_radio.appendChild(dot_radio)

    const label: HTMLLabelElement = document.createElement('label')
    label.classList.add('mat-typografy')
    label.append(this.caption)

    this.el.nativeElement.classList.add('radio-button')
    this.el.nativeElement.prepend(span_radio)
    this.el.nativeElement.appendChild(label)

    this.el.nativeElement.addEventListener('click', () => {
      this.onChange(this.value)
    })
  }

}