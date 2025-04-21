import type { Locale } from 'vue-i18n'
import type { UserModule } from '~/types'
import { createI18n } from 'vue-i18n'

const DEFAULT_LOCALE = 'zh-CN'

export const cashedLocaleName = useLocalStorage('locale-name', DEFAULT_LOCALE)

// Import i18n resources
// https://vitejs.dev/guide/features.html#glob-import
//
// Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
const i18n = createI18n({
  legacy: false,
  locale: '',
  messages: {},
})

const localesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../../locales/*.yml'))
    .map(([path, loadLocale]) => [path.match(/([\w-]*)\.yml$/)?.[1], loadLocale]),
) as Record<Locale, () => Promise<{ default: Record<string, string> }>>

export const availableLocales = Object.keys(localesMap)

const loadedLanguages: string[] = []

function setI18nLanguage(lang: Locale) {
  i18n.global.locale.value = lang as any
  if (typeof document !== 'undefined')
    document.querySelector('html')?.setAttribute('lang', lang)

  cashedLocaleName.value = lang

  return lang
}

export async function loadLanguageAsync(lang: string): Promise<Locale> {
  // If the same language
  if (i18n.global.locale.value === lang)
    return setI18nLanguage(lang)

  // If the language was already loaded
  if (loadedLanguages.includes(lang))
    return setI18nLanguage(lang)

  // If the language hasn't been loaded yet
  const messages = await localesMap[lang]()

  let oldArcoI18nMessage = { OLD_MESSAGE: {} }

  if (lang === 'zh-CN')
    oldArcoI18nMessage = await import('~/locale/zh-CN')
  if (lang === 'en')
    oldArcoI18nMessage = await import('~/locale/en')

  i18n.global.setLocaleMessage(lang, {
    ...oldArcoI18nMessage.OLD_MESSAGE,
    ...messages.default,
  })

  loadedLanguages.push(lang)
  return setI18nLanguage(lang)
}

export const install: UserModule = ({ app }) => {
  app.use(i18n)
  // loadLanguageAsync(cashedLocaleName.value)
  // TODO: 暂时强制中文
  loadLanguageAsync(DEFAULT_LOCALE)
}
