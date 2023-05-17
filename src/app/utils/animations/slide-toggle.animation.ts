import { transition, trigger } from "@angular/animations"
import { slideDownAnimation, slideUpAnimation } from "./animations"

export const slideToggleAnimation = trigger(
  'slideToggleAnimation',
  [
    transition(
      ':enter', 
      slideDownAnimation
    ),
    transition(
      ':leave', 
      slideUpAnimation
    )
  ]
)