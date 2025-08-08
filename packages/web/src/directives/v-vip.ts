import type { Directive } from 'vue'

type AnyFn = (...args: any[]) => any

const events = ['click', 'keydown', 'keyup', 'mousedown', 'mouseup', 'touchend', 'touch', 'touchstart']

interface VipElement extends HTMLElement {
  killerEvent: AnyFn
}

export const vVip: Directive = {
  created(el: VipElement) {
    const { vip } = storeToRefs(useAuthStore())

    watchEffect(() => {
      if (vip.value?.vip) {
        removeKillerEvent(el)
      }
      else {
        el.style.opacity = '0.4'
        el.style.cursor = 'not-allowed'
        el.style.pointerEvents = 'none'

        el.setAttribute('disabled', '')
        el.setAttribute('tabindex', '-1')

        addKillerEvent(el)
      }
    })
  },
  unmounted(el: VipElement) {
    removeKillerEvent(el)
  },
}

function addKillerEvent(el: VipElement) {
  const killerEvent = (e: Event) => {
    e.stopImmediatePropagation()
    e.preventDefault()
  }

  events.forEach(evt =>
    el.addEventListener(evt, killerEvent, { capture: true }),
  )

  el.killerEvent = killerEvent

  return killerEvent
}

function removeKillerEvent(el: VipElement) {
  const killEvent = (el as any)._authKillers
  if (killEvent) {
    events.forEach(evt =>
      el.removeEventListener(evt, killEvent, { capture: true }),
    )
  }
}
