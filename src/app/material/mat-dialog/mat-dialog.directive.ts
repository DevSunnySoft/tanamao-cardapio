import { Directive, Inject, Input, EventEmitter, Output, ViewContainerRef } from '@angular/core'
import { DOCUMENT } from '@angular/common'

export type MatDialogConfig = {
  component: any
}

@Directive({
  selector: 'mat-dialog',
  exportAs: 'matDialog'
})
export class MatDialogDirective {
  @Output() close: EventEmitter<any> = new EventEmitter()
  @Input() config!: MatDialogConfig

  private bg?: HTMLElement
  private viewindex = -1

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private _vcr: ViewContainerRef
  ) {}

  public show(data: any) {
    if (!this.bg) {
      this.viewindex = this._vcr.length

      const componentRef = this._vcr.createComponent<any>(this.config.component, {
        index: this.viewindex
      })

      componentRef.instance.data = {
        data,
        close: () => this.onClose(),
        style: {zIndex:`${99 + this.document.getElementsByClassName('mat-dialog').length * 2}`}
      }
      componentRef.changeDetectorRef.detectChanges()
    }
  }

  public onClose() {    
    if (this.viewindex >= 0) {
      this._vcr.remove(this.viewindex)
      this.viewindex = -1

      this.close.emit()
    }
  }
}