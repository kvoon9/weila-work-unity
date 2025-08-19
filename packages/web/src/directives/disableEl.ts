export type AnyFn = (...args: any[]) => any

const events = ['click', 'keydown', 'keyup', 'mousedown', 'mouseup', 'touchend', 'touch', 'touchstart']

export interface DisableElement extends HTMLElement {
  killerEvent: AnyFn
}

export function enableEl(el: DisableElement) {
  removeKillerEvent(el)
}
export function disableEl(el: DisableElement) {
  el.style.opacity = '0.4'
  el.style.cursor = 'not-allowed'
  el.style.pointerEvents = 'none'

  el.setAttribute('disabled', '')
  el.setAttribute('tabindex', '-1')

  addKillerEvent(el)
}

export function addKillerEvent(el: DisableElement) {
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

function removeKillerEvent(el: DisableElement) {
  const killEvent = (el as any)._authKillers
  if (killEvent) {
    events.forEach(evt =>
      el.removeEventListener(evt, killEvent, { capture: true }),
    )
  }
}
