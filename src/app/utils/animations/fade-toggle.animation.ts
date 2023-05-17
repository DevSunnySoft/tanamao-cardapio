import { transition, trigger } from "@angular/animations"
import { fadeInAnimation, fadeOutAnimation } from "./animations"

export const fadeToggleAnimation = trigger(
  'fadeToggleAnimation',
  [
    transition(':enter', fadeInAnimation),
    transition(':leave', fadeOutAnimation)
  ]
)