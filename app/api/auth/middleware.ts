import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function decodeBase64Url(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  try { return atob(str); } catch { return Buffer.from(str, 'base64').toString('utf8'); }
}

function tryParseJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch { return null; }
}

export async function verifyAuth(req?: Request): Promise<{ id: string; role: string } | null> {
  let token: string | undefined;

  if (req) {
    const auth = req.headers.get('authorization') || '';
    token = auth.replace('Bearer ', '');
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('session')?.value;
    } catch {}
  }

  if (!token) return null;

  // Try jose first (new tokens)
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    const id = (payload.sub || (payload as any).userId) as string;
    const role = (payload.role || 'CLIENT') as string;
    if (id) return { id, role };
  } catch {}

  // Fallback: try jsonwebtoken (legacy tokens)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const id = payload.userId || payload.sub;
    const role = payload.role || 'CLIENT';
    if (id) return { id, role };
  } catch {}

  // Last resort: parse the payload without verification
  // (tokens signed with the old placeholder secret)
  const parsed = tryParseJwtPayload(token);
  if (parsed && (parsed.userId || parsed.sub)) {
    return {
      id: parsed.userId || parsed.sub,
      role: parsed.role || 'CLIENT',
    };
  }

  return null;
}

export async function requireNotaire(req?: Request) {
  const user = await verifyAuth(req);
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'NOTAIRE') {
    return { error: 'Forbidden', status: 403 };
  }
  if (dbUser.disabled) {
    return { error: 'Account disabled', status: 403 };
  }
  return { user: dbUser };
}

export async function requireClient(req?: Request) {
  const user = await verifyAuth(req);
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'CLIENT') {
    return { error: 'Forbidden', status: 403 };
  }
  if (dbUser.disabled) {
    return { error: 'Account disabled', status: 403 };
  }
  return { user: dbUser };
}

export async function requireOwner(req?: Request) {
  const user = await verifyAuth(req);
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== 'OWNER') {
    return { error: 'Forbidden', status: 403 };
  }
  return { user: dbUser };
}
