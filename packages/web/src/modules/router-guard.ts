import type { UserModule } from '~/types'

export const install: UserModule = ({ router }) => {
  router.beforeEach((to, _, next) => {
    const requiresAuth = to.meta.requiresAuth ?? true

    // loop issue
    if (requiresAuth && !localStorage.getItem('token')) {
      next({ name: '/login/', replace: true })
    }
    else {
      // Proceed to the requested route
      next()
    }
  })
}
