import { MetaMesh } from ".."
import * as TWEEN from "@tweenjs/tween.js"

export function openDoor(item: MetaMesh & {
  opened: boolean
}) {
  return new TWEEN.Tween({ rotate: 0 })
    .to(
      {
        rotate: 0.1,
      },
      200
    )
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function (obj) {
      if(item.opened) {
        item.rotation.y -= -(Math.PI / 3) * obj.rotate
      }else {
        item.rotation.y += -(Math.PI / 3) * obj.rotate
      }
    }).onComplete(() => {
      item.opened = item.opened ? false : true
    })
}
