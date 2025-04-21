import { parseURL } from 'ufo'

export const isRemoteImage = (url: string) => url.startsWith('http')

export function isLocalhost(url: string) {
  const { host = '' } = parseURL(url)
  return host.startsWith('192.168.0') || host.startsWith('localhost')
}
