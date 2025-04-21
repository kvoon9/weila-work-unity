import type { UserModule } from '~/types'
import VueVideoPlayer from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

export const install: UserModule = ({ app }) => {
  app.use(VueVideoPlayer)
}
