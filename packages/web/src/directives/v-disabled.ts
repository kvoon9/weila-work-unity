import type { Directive } from "vue"
import { type DisableElement, useDisableEl } from "./disableEl"
import { isObject } from "@antfu/utils"

interface VDisabledOptions {
  value: boolean
  title?: string
}

export const vDisabled: Directive = {
  mounted(el: DisableElement, binding) {
    const { disable, enable } = useDisableEl(el)

    const options: VDisabledOptions = (isObject(binding.value)
      ? binding.value as any
      : { value: binding.value })
        ?? { value: false }
    
    const { 
      value: isDisabled = false,
      title = '已禁用'
    } = options

    if (isDisabled) {
      disable(title)
    }
    else {
      enable()
    }
  },
}
