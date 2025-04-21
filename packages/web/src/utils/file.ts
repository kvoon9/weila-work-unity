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

export function downloadFile<T extends Blob>(file: T, name?: string) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = name || 'Untitled'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
