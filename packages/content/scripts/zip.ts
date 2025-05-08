import { $, echo } from 'zx'
// import { date } from '../.output/nitro.json'
import { name, version } from '../package.json'

export function genFormatDate(date: Date) {
  const Y = date.getFullYear()
  const M = `${date.getMonth() + 1}`.padStart(2, '0')
  const D = `${date.getDate()}`.padStart(2, '0')
  const H = `${date.getHours()}`.padStart(2, '0')
  const m = `${date.getMinutes()}`.padStart(2, '0')
  const s = `${date.getSeconds()}`.padStart(2, '0')
  return `${Y}${M}${D}${H}${m}${s}`
}

async function run() {
  const input = `./.output/public/*`
  // const output = `pkg/${name}_${version}_${date.replaceAll(':', '-') || genFormatDate(new Date())}.zip`
  const output = `pkg/${name}_${version}_${genFormatDate(new Date())}.zip`

  await $`cp .output/public/index.html .output/public/corp-manager.html`

  echo`${output}`

  await $`7z a ${output} ${input}`
}

await run()
