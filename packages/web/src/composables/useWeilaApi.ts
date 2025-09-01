import { getRootUrl } from '@kvoon/utils'
import { WeilaApi } from '@wl/network'
import { shallowRef } from 'vue'
import { appid, appkey } from '~/shared/const'

const weilaApi = shallowRef(new WeilaApi(
  // demo server
  appid.value,
  appkey.value,

  // '102065',
  // '3c227f2cbc2084ebdd9617fd283c42c7',
  { baseURL: `${getRootUrl(window.location.href)}/v2` },
))

export function useWeilaApi() {
  return weilaApi
}
