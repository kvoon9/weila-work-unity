import { createApp, createRouter, defineEventHandler } from 'h3'
import * as mock from '../fixture/mock'

export const app = createApp()
const router = createRouter()
app.use(router)

mock.default.forEach((i) => {
  router
    .post(
      i.route,
      defineEventHandler(i.handler),
    )
    .get(
      i.route,
      defineEventHandler(i.handler),
    )
})
