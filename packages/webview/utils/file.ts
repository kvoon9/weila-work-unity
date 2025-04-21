export function readImageFile(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onload = () => {
      resolve(fr.result as string) // dataUrl
    }
    fr.onerror = reject
    fr.readAsDataURL(file)
  })
}
