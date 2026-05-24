import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_prod'
const JWT_EXPIRATION_MS = parseInt(process.env.JWT_EXPIRATION_MS || '86400000', 10)

export function generateToken(subject, role = 'USER') {
  return jwt.sign(
    { sub: subject, role },
    JWT_SECRET,
    { expiresIn: Math.floor(JWT_EXPIRATION_MS / 1000) }
  )
}

export function parseSubject(authHeader) {
  if (!authHeader) return null
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.sub
  } catch {
    return null
  }
}


