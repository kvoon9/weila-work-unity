import { isObject } from '@antfu/utils'

export function deepToValue(obj: Record<string, any>) {
  for (const key in obj) {
    if (isObject(obj[key]) && Array.isArray(!obj[key]))
      deepToValue(obj[key])

    if (isReactive(obj[key]) || isRef(obj[key])) {
      obj[key] = toValue(obj[key])
    }
  }
}
