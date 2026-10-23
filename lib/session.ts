// Signed session tokens: "<expiry-ms>.<hmac>". Uses Web Crypto so it works in
// proxy.ts as well as in server code. Changing APP_PASSWORD logs everyone out.

export const SESSION_COOKIE = 'btu_session'
export const SESSION_DAYS = 180

const enc = new TextEncoder()

function secret() {
  const s = process.env.AUTH_SECRET || (process.env.APP_PASSWORD ? 'btu-session:' + process.env.APP_PASSWORD : '')
  if (!s) throw new Error('APP_PASSWORD is not set')
  return s
}

async function key() {
  return crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

function toB64url(buf: ArrayBuffer) {
  return Buffer.from(buf).toString('base64url')
}

export async function createToken() {
  const exp = Date.now() + SESSION_DAYS * 86_400_000
  const sig = await crypto.subtle.sign('HMAC', await key(), enc.encode(String(exp)))
  return `${exp}.${toB64url(sig)}`
}

export async function verifyToken(token: string | undefined | null) {
  if (!token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false
  try {
    return await crypto.subtle.verify('HMAC', await key(), Buffer.from(sig, 'base64url'), enc.encode(exp))
  } catch {
    return false
  }
}
