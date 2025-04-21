import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  client: {
    VITE_WEB_SOCK: z.string().url(),
    VITE_WL_APPID: z.string(),
    VITE_WL_APPKEY: z.string(),
  },
  runtimeEnv: import.meta.env,
  skipValidation: import.meta.env.SKIP_ENV_VALIDATION === 'development',
  clientPrefix: 'VITE_',
})
