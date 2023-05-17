import { transition, trigger } from "@angular/animations"
import { slideLeftAnimation, slideRightAnimation } from "./animations"

export const slideXToggleAnimation = trigger(
  'slideXToggleAnimation', 
  [
    transition(
      ':enter', 
      slideLeftAnimation
    ),
    transition(
      ':leave', 
      slideRightAnimation
    )
  ]
)