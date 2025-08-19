import type { Directive } from 'vue'
import { useDisableEl, type DisableElement } from './disableEl'

export const vVip: Directive = {
  created(el: DisableElement) {
    const { vip } = storeToRefs(useAuthStore())
    const {disable, enable} = useDisableEl(el)

    watchEffect(() => {
      if (vip.value?.vip) {
        enable()
      }
      else {
        disable()
      }
    })
  },
}
