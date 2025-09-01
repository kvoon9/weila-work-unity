import type { Directive } from 'vue'
import type { DisableElement } from './disableEl'
import { useDisableEl } from './disableEl'

export const vVip: Directive = {
  created(el: DisableElement) {
    const { vip } = storeToRefs(useAuthStore())
    const { disable, enable } = useDisableEl(el)

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
