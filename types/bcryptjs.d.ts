declare module 'bcryptjs' {
  export function hash(s: string, salt: number | string): Promise<string>
  export function compare(s: string, hash: string): Promise<boolean>
  export function genSaltSync(rounds?: number): string
  export function hashSync(s: string, salt: string | number): string
  export function compareSync(s: string, hash: string): boolean
  const bcrypt: {
    hash: typeof hash
    compare: typeof compare
    genSaltSync: typeof genSaltSync
    hashSync: typeof hashSync
    compareSync: typeof compareSync
  }
  export default bcrypt
}
