import { addDevServerHandler, defineNuxtModule } from '@nuxt/kit'
import * as mock from '~~/fixture/mock'
import { isMocking } from '~/shared/const'

export default defineNuxtModule({
  setup() {
    if (isMocking.value) {
      mock.default.forEach((i) => {
        addDevServerHandler(i)
      })
    }
  },
})
