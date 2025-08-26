import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'
import { shallowRef } from 'vue'

const weilaApi = shallowRef(new WeilaApi(
  '102036',
  'b3c658bd2e637c65efb134fb381d4a18',
  { baseURL: `${getRootUrl(window.location.href)}/v2` },
))

export function useWeilaApi() {
  return weilaApi
}
