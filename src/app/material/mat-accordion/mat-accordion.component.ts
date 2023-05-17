import { ChangeDetectorRef, Component, Input, TemplateRef, OnInit } from '@angular/core'
import { slideToggleAnimation } from 'src/app/utils/animations/slide-toggle.animation'

@Component({
  selector: 'mat-accordion',
  template: `
    <div class="mat-accordion" >
      <div class="ripple app-section mat-accordion-header" [ngClass]="[show ? 'mat-accordion-header-expanded' : 'mat-accordion-header-contract']" (click)="change()" >
        <span class="label" >{{label}}</span>
        <span class="description" >{{ show ? hideLabel : showLabel}}</span>
        <span class="mat-icon" >expand_more</span>
      </div>
      <div class="mat-expansion" *ngIf="containerTemplate && show" [@slideToggleAnimation] >
        <ng-container *ngTemplateOutlet="containerTemplate" ></ng-container>
      </div>
    </div>`,
  styleUrls: ['./mat-accordion.component.sass'],
  animations: [slideToggleAnimation]
})
export class MatAccordionComponent implements OnInit {
  private _show = false
  @Input() containerTemplate: TemplateRef<Element> | undefined
  @Input() label: string = ''
  @Input() showLabel: string = 'Toque para ver'
  @Input() hideLabel: string = 'Toque para recolher'

  //@Output() onViewChange: EventEmitter = new EventEmitter()

  constructor(
    private _cdr: ChangeDetectorRef
  ) {
    this._cdr.detach()
  }

  @Input()
  set show(show: boolean) {
    this._show = show
  }

  get show(): boolean {
    return this._show
  }

  change() {
    this.show = !this._show
    this._cdr.detectChanges()
  }

  ngOnInit(): void {
    this._cdr.detectChanges()
  }
}
