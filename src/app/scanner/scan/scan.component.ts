import { ChangeDetectorRef, Component, NgZone } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import QrScanner from 'qr-scanner';
import { AppService } from "src/app/app.service";
import { OrderService } from "src/app/orders/order.service";

@Component({
  selector: 'app-scan',
  templateUrl: 'scan.component.html',
  styleUrls: ['scan.component.sass']
})
export class ScanComponent {
  private videoElem?: HTMLVideoElement
  private scanner?: QrScanner
  private readed = false
  
  public flashOn: boolean = false

  constructor(
    private _cdr: ChangeDetectorRef,
    private _zone: NgZone,
    private _appService: AppService,
    private _localOrder: OrderService,
    private _route: ActivatedRoute
  ) {
    this._cdr.detach()
  }

  private validateData(data: string): boolean {
    //const regexp = /^https:\/\/.+\/([a-zA-z0-9=]+)$/
    const regexp = /^https:\/\/.+\/([a-zA-z0-9=]+)$/

    if (regexp.test(data)) {
      const validator = regexp.exec(data)

      if (validator) {
        const hash = validator.pop()
        this._localOrder.scanHash = hash || ""

        return true
      }
    }

    return false
  }

  private read(result: any): void {
    if (!this.readed) {
      this.readed = true

      this._zone.runOutsideAngular(() =>
        this.scanner!.stop()
      )

      const data = result.data
      if (this.validateData(data)) {
        if (this._route.snapshot.queryParamMap.has('change'))
          this._appService.changingQrCode = true

        this.redirect()
      }
      else
        this._appService.log = 'Este código QR é inválido'

      this._cdr.detectChanges()
    }
  }

  private initScanner(): void {
    this._zone.runOutsideAngular(() => {
      if (window)
        this.videoElem = window.document.getElementById('videoElem') as HTMLVideoElement

      if (this.videoElem) {
        this.scanner = new QrScanner(
          this.videoElem,
          result => this.read(result), 
          {
            highlightScanRegion: true,
            maxScansPerSecond: 10,
            highlightCodeOutline: true
          }
        )

        this.flashOn = this.scanner.isFlashOn()

        if (this.scanner)
          this.scanner.start()
      }
    })

    this._cdr.detectChanges()
  }

  private redirect(): void {
    if (window)
      window.location.href = '/'
  }
  
  public onClickBack(): void {
    if (window)
      window.location.href = '/'
  }

  public onClickToggleFlash(): void {
    this.flashOn = !this.flashOn
    this._zone.runOutsideAngular(() => this.scanner!.toggleFlash())
    this._cdr.detectChanges()
  }

  ngOnInit(): void {
    this.initScanner()
  }

}