import { availableLocales, loadLanguageAsync } from '~/modules/i18n'

export function useToggleLocales() {
  const { locale } = useI18n()
  const toggle = async () => {
    const locales = availableLocales
    const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
    return loadLanguageAsync(newLocale).then(() => {
      locale.value = newLocale
    })
  }
  return { toggle }
}
