import { Injectable } from "@angular/core";
import { HammerGestureConfig } from "@angular/platform-browser";
import * as Hammer from 'hammerjs'

@Injectable({
  providedIn: "root"
})
export class HammerConfig extends HammerGestureConfig {
  override overrides: { [key: string]: Object } = <any>{
      'swipe': { direction: Hammer.DIRECTION_HORIZONTAL },
      'pinch': { enable: false },
      'rotate': { enable: false },
      'pan': { enable: false }
  };
}