export function getMd5Middle8Chars(md5: string) {
  // 888e0f79573741ac3e1f09a3c9e46968 -> 41ac3e1f
  return md5.slice(12, 20)
}
