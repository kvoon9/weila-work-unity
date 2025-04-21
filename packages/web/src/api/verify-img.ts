import config from '~/api'
import { weilaFetch } from './instances/fetcher'

export async function verifyImgFetcher() {
  const res = await weilaFetch.native(`${config.baseURL}/corp/web/get-verifycode-image?width=150&height=50`)
  const blob = await res.blob()
  const src = URL.createObjectURL(blob)
  return src
}
