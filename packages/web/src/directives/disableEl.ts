import { objectEntries } from '@antfu/utils'

export type AnyFn = (...args: any[]) => any

const events = ['click', 'keydown', 'keyup', 'mousedown', 'mouseup', 'touchend', 'touch', 'touchstart']

export interface DisableElement extends HTMLElement {
  killerEvent: AnyFn
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

const elUIStatesMap = new Map<DisableElement, {
  title: string
  styles: Record<string, string>
  attrs: Record<string, any>
}>()

export function useDisableEl(el: DisableElement) {
  // const isHover = useElementHover(el)

  const enable = () => {
    const styles = elUIStatesMap.get(el)?.styles ?? {}
    const attrs = elUIStatesMap.get(el)?.attrs ?? {}

    for (const [key, value] of objectEntries(styles)) {
      el.style[key as any] = value as any
    }

    for (const [key, value] of objectEntries(attrs)) {
      el.setAttribute(key, value)
    }

    removeKillerEvent(el)
  }

  const disable = (hintText?: string) => {
    elUIStatesMap.set(el, {
      title: el.title,
      styles: {},
      attrs: {},
    })

    const styles = elUIStatesMap.get(el)?.styles ?? {}
    const attrs = elUIStatesMap.get(el)?.attrs ?? {}

    styles.opacity = el.style.opacity
    el.style.opacity = '0.4'

    styles.cursor = el.style.cursor
    el.style.cursor = 'not-allowed'

    if (hintText)
      el.title = hintText

    // TODO
    // el.setAttribute('popovertarget', 'test')
    // el.setAttribute('popovertargetaction', 'toggle')
    // watch(isHover, () => {
    //   // @ts-expect-error type error
    //   document.querySelector('#test')?.togglePopover()
    // })

    attrs.disabled = el.getAttribute('disabled')
    el.setAttribute('disabled', '')

    attrs.tabindex = el.getAttribute('tabindex')
    el.setAttribute('tabindex', '-1')

    addKillerEvent(el)
  }

  return {
    disable,
    enable,
  }
}
