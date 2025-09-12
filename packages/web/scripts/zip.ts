/* eslint-disable antfu/no-import-dist */
import { $, echo } from 'zx'
import { timestamp } from '../dist/build-info.json'
import { name } from '../package.json'

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
  const { stdout: branch } = await $`git branch --show-current`

  const input = `./dist/*`
  const output = `pkg/${branch.trim()}_${name}_${genFormatDate(new Date(timestamp))}.zip`

  echo`${output}`

  await $`7z a ${output} ${input}`

  await $`clippy ${output}`
}

await run()
