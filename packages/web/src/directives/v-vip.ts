import type { Directive } from 'vue'
import { disableEl, enableEl, type DisableElement } from './disableEl'

export const vVip: Directive = {
  created(el: DisableElement) {
    const { vip } = storeToRefs(useAuthStore())

    watchEffect(() => {
      if (vip.value?.vip) {
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
