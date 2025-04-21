// import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import type { UserModule } from '~/types'
import { createPinia } from 'pinia'

export const install: UserModule = ({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
  // pinia.use(piniaPluginPersistedstate)
}
