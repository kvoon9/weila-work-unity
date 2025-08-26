import CryptoJS from 'crypto-js'

export function useLocalCrypto(name: string, ENCRYPTION_KEY: string = 'weila-frontend-key') {
  return useLocalStorage(name, new Map<string, string>(), {
    serializer: {
      read: (v: string) => {
        const decrypted = CryptoJS.AES.decrypt(v, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8)
        return new Map(JSON.parse(decrypted))
      },
      write: (v: Map<string, string>) => {
        const jsonString = JSON.stringify(Array.from(v.entries()))
        return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
      },
    },
  })
}
