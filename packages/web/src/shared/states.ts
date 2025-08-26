export const timestamp = useTimestamp({ offset: 0 })
export const et = computed(() => Math.floor(timestamp.value / 1000))

/**
 * Theme
 */

// export const isDark = useDark()
// https://arco.design/vue/docs/dark
watchEffect(() => {
  document.body.removeAttribute('arco-theme')
  // isDark.value
  //   ? document.body.setAttribute('arco-theme', 'dark')
  //   : document.body.removeAttribute('arco-theme')
})

const emojiIdMap = Object.fromEntries(
  Object.entries(import.meta.glob('~/assets/emoji/**/*.png', { eager: true }))
    .map(([path, loadEmoji]) => [path.match(/([\w-]*)\.png$/)?.[1], loadEmoji]),
) as Record<string, { default: string }>

export const emojiList = [
  '[微笑]',
  '[呲牙]',
  '[傲慢]',
  '[酷]',
  '[白眼]',
  '[不高兴]',
  '[笑哭]',
  '[闭嘴]',
  '[持刀]',
  '[大汗]',
  '[发怒]',
  '[感冒]',
  '[鬼脸]',
  '[害羞]',
  '[汗]',
  '[花痴]',
  '[滑稽]',
  '[坏笑]',
  '[机智]',
  '[惊吓]',
  '[可怜]',
  '[抠鼻]',
  '[哭]',
  '[左哼哼]',
  '[右哼哼]',
  '[苦笑]',
  '[困]',
  '[懒]',
  '[流鼻血]',
  '[亲亲]',
  '[糗]',
  '[热泪]',
  '[认真]',
  '[伤心]',
  '[衰]',
  '[委屈]',
  '[疑问]',
  '[邪恶]',
  '[斜眼]',
  '[中指]',
  '[加好友]',
  '[再见]',
  '[皱眉]',
  '[吐舌]',
  '[赞]',
  '[弱]',
  '[OK]',
  '[晕]',
  '[吐]',
  '[紫薇别走]',
  '[大刀]',
  '[鬼魂]',
  '[骷髅]',
  '[魔鬼]',
  '[玫瑰]',
  '[枯萎]',
  '[心]',
  '[心碎]',
  '[药丸]',
  '[咖啡]',
  '[棒球]',
  '[橙汁]',
  '[篮球]',
  '[礼物]',
  '[啤酒]',
  '[气球]',
  '[眼镜]',
  '[桌球]',
  '[足球]',
  '[0]',
  '[1]',
  '[2]',
  '[3]',
  '[4]',
  '[5]',
  '[6]',
  '[7]',
  '[8]',
  '[9]',
]

export const emojiMap = Object.fromEntries(
  emojiList.map((text, idx) => {
    const id = `face${idx + 1}`
    return [text, emojiIdMap[id]]
  }),
)

export const fileIconsMap = Object.fromEntries(
  Object.entries(import.meta.glob('~/assets/file/**/*.png', { eager: true }))
    .map(([path, fileIcon]) => {
      return [path.match(/([\w-]*)\.png$/)?.[1].toLowerCase(), fileIcon]
    }),
) as Record<string, { default: string }>

// export const hasNewBundle = shallowRef(false)
export async function hasNewBundle() {
  if (!import.meta.env.PROD)
    return false

  const res = await fetch('/build-info.json')
  if (!res.ok) {
    return false
  }

  const { timestamp }: { timestamp: number } = await res.json()

  if (String(timestamp) !== String(__BUILD_TIME__)) {
    return true
  }
}

export const autoLogin = useLocalStorage('auto_login', false)
