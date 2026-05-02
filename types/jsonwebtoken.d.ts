declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string
  export function verify(token: string, secret: string, options?: any): any
  export function decode(token: string): any
  const jwt: {
    sign: typeof sign
    verify: typeof verify
    decode: typeof decode
  }
  export default jwt
}
