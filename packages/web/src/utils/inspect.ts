import { isFunction } from '@antfu/utils'

/**
 * @param args - any vue reactive various
 * @description - debug reactive various
 * @see https://svelte.dev/docs/svelte/$inspect
 * @author kvoon
 */
export function $inspect(...args: MaybeRefOrGetter[]) {
  /* eslint-disable no-console */
  let logFn = console.log
  // TODO: change type
  const type: 'init' | 'update' = 'update'

  if (import.meta.env.DEV) {
    watchImmediate(args, (cur) => {
      logFn(type, ...cur.map((arg) => {
        return isFunction(arg) ? arg() : unref(arg)
      }))
    })
  }

  return {
    with(fn: (type: string, ...args: any) => void) {
      logFn = fn
    },
  } as const
}
