import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required but not set');
}
const JWT_SECRET = secret;

export function signToken(payload: Record<string, unknown>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken<T = jwt.JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
