import type { UserModule } from '~/types'
import { useAuthStore } from '~/stores/auth'

export const install: UserModule = ({ router }) => {
  router.beforeEach((to, _, next) => {
    const { isLogin } = storeToRefs(useAuthStore())
    const requiresAuth = to.meta.requiresAuth ?? true

    // loop issue
    if (requiresAuth && !isLogin.value) {
      next({ name: '/login/', replace: true })
    }
    else {
      // Proceed to the requested route
      console.log('to', to)
      next()
    }
  })
}
