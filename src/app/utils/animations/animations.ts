import { animate, animation, style } from "@angular/animations"

export const slideDownAnimation = animation(
  [
    style({
      height: 0
    }),
    animate(200)
  ]
)
export const slideUpAnimation = animation(
  [
    animate(200, style({ height: 0}))
  ]
)

export const slideLeftAnimation = animation(
  [
    style({
      marginLeft: '-100%'
    }),
    animate(200)
  ]
)
export const slideRightAnimation = animation(
  [
    animate(200, style({ marginLeft: '100%'}))
  ]
)

export const fadeOutAnimation = animation(
  [
    animate(300, style({ opacity: 0}))
  ]
)

export const fadeInAnimation = animation(
  [
    style({
      opacity: 0
    }),
    animate(300, style({ opacity: 1}))
  ]
)