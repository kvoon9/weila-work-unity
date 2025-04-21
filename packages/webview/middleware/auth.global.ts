export default defineNuxtRouteMiddleware((to) => {
  const { isLogin } = useAuthStore()

  // @ts-expect-error type error
  if (!isLogin && to.meta.meta?.public !== true)
    return navigateTo('/login')

  if (isLogin && (to.path.includes('/login') || to.path === '/')) {
    const { data: corp } = useCorp()

    if (!corp.value)
      return navigateTo('/me')

    return navigateTo('/contacts')
  }
})
