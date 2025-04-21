export function useToast(...args: any[]) {
  return {
    toast(...args: any[]) {
      console.log('args',args)
    }
  }
}