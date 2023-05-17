import { Component, ElementRef, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter, AfterViewInit, OnInit, HostListener } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AppService } from "src/app/app.service";
import { slideXToggleAnimation } from "src/app/utils/animations/slide-x-toggle.animation";

@Component({
  templateUrl: 'location.component.html',
  //styleUrls: [''],
  animations: [slideXToggleAnimation]
})
export class LocationComponent implements AfterViewInit, OnInit {
  @ViewChild('dialog') dialog?: ElementRef<HTMLDivElement>
  @Input() public data: any
  @Output() close: EventEmitter<number | undefined> = new EventEmitter()

  public show = true
  public locationForm: FormGroup = new FormGroup({
    location: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{1,3}$/)])
  })

  get location(): FormControl {
    return this.locationForm.get('location') as FormControl
  }

  constructor(
    private _cdr: ChangeDetectorRef
  ) {
    this._cdr.detach()
  }

  private resize(): void {
    if (this.dialog && window)
      this.dialog.nativeElement.style.height = `${(window as Window).innerHeight}px`

    this._cdr.detectChanges()
  }

  public onClickClose(): void {
    this.show = false
    this._cdr.detectChanges()
    this.close.emit()
    /*
    setTimeout(() => {
      if (this.data.close)
        this.data.close()
    }, 200)
    */
  }

  public onSubmit(ev: Event): void {
    ev.preventDefault()
    
    this.location.markAsTouched()
    this._cdr.detectChanges()

    if (this.locationForm.valid && this.data.data.sendOrder) {
      this.data.data.sendOrder(this.location.value)
      this.onClickClose()
    }
  }

  ngOnInit(): void {
    this._cdr.detectChanges()
  }

  ngAfterViewInit(): void {
    if (this.dialog) {
      this.dialog.nativeElement.className = `mat-dialog`
      this.dialog.nativeElement.style.zIndex = this.data.style.zIndex
    }

    this.location.statusChanges.subscribe(() => this._cdr.detectChanges())
  }

  @HostListener("window:resize") onResize() {
    this.resize()
  }

}