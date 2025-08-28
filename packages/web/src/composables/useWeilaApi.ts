import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'
import { shallowRef } from 'vue'

const weilaApi = shallowRef(new WeilaApi(
  // demo server
  // '102036',
  // 'b3c658bd2e637c65efb134fb381d4a18',

  '102065',
  '3c227f2cbc2084ebdd9617fd283c42c7',
  { baseURL: `${getRootUrl(window.location.href)}/v2` },
))

export function useWeilaApi() {
  return weilaApi
}
