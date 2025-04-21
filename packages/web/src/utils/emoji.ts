import { emojiMap } from '~/shared/states'

export function emojify(text: string) {
  for (const keyword in emojiMap) {
    if (text.includes(keyword)) {
      const src = emojiMap[keyword].default
      text = text.replaceAll(keyword, `<img src=${src} style="width: 2rem; height; 2rem"; display: inline-block />`)
    }
  }

  return text
}
