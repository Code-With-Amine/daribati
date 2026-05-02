import jwt from 'jsonwebtoken'

export function signToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret')
  } catch (e) {
    return null
  }
}
