import { Component, HostListener, OnDestroy } from '@angular/core';
import { AppService } from './app.service';
import { fadeToggleAnimation } from './utils/animations/fade-toggle.animation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
  animations: [fadeToggleAnimation]
})
export class AppComponent {
  public readonly log$ = this._appService.log$

  constructor(
    private _appService: AppService
  ) { }


  @HostListener('window:beforeunload', ['$event'])
  unloadHandler() {
    if (this._appService.ws)
      this._appService.ws.unsubscribe()
  }

}
