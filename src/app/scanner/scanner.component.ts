import { DOCUMENT } from "@angular/common";
import { ChangeDetectorRef, Component, Inject, OnInit } from "@angular/core";
import { AppService } from "../app.service";

@Component({
  templateUrl: 'scanner.component.html',
  styleUrls: ['scanner.component.sass']
})
export class ScannerComponent implements OnInit {
  public showScanPage = false
  public out = !this.greetings

  get greetings(): boolean {
    return window && window.sessionStorage.getItem('greet') === null ? true : false
  }

  constructor(
    private _cdr: ChangeDetectorRef,
    private _appService: AppService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this._cdr.detach()
  }

  setAsGreet() {
    if (window)
      window.sessionStorage.setItem('greet', 'yes')
    this._cdr.detectChanges()
  }
  
  public onClickScan(): void {
    this.showScanPage = true
    this._cdr.detectChanges()
  }

  public onClickBack() {
    if (window)
      window.location.href = '/'
  }

  ngOnInit(): void {
    if (this.greetings) {
      setTimeout(() => this.setAsGreet(), 1000)
      setTimeout(() => {
        this.out = true
        this._cdr.detectChanges()
      }, 1300)
    }

    this._cdr.detectChanges()
  }

}