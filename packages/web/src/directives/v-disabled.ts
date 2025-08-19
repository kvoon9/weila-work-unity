import type { Directive } from "vue"
import { type DisableElement, enableEl, disableEl } from "./disableEl"

export const vDisabled: Directive = {
  created(el: DisableElement, binding) {
    watchEffect(() => {
      if (binding.value) {
        enableEl(el)
      }
      else {
        disableEl(el)
      }
    })
  },
  unmounted(el: DisableElement) {
    enableEl(el)
  },
}
