import { describe, expect, it } from 'vitest'
import { getMd5Middle8Chars } from './string'

describe('getMd5Middle8Chars', () => {
  it('should return the middle 8 chars of the md5', () => {
    expect(getMd5Middle8Chars('888e0f79573741ac3e1f09a3c9e46968')).toBe('41ac3e1f')
  })
})
