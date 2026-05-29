import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/app/api/auth/middleware'

export async function POST(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { receiverId, content, dossierId } = await req.json()
    if (!receiverId || !content) {
      return NextResponse.json({ error: 'receiverId et content requis' }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: { senderId: user.id, receiverId, content, dossierId: dossierId || null },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const user = await verifyAuth(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const withUserId = url.searchParams.get('with')
  const type = url.searchParams.get('type')

  try {
    // List conversations
    if (type === 'conversations') {
      const messages = await prisma.message.findMany({
        where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, name: true, email: true, avatar: true } },
          receiver: { select: { id: true, name: true, email: true, avatar: true } },
        },
      })

      const conversationsMap = new Map<string, any>()
      for (const msg of messages) {
        const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId
        const other = msg.senderId === user.id ? msg.receiver : msg.sender
        if (!conversationsMap.has(otherId)) {
          conversationsMap.set(otherId, { user: other, lastMessage: msg, unread: 0 })
        }
      }

      // Count unread
      const unreadCounts = await prisma.message.groupBy({
        by: ['senderId'],
        where: { receiverId: user.id, readAt: null },
        _count: true,
      })
      for (const uc of unreadCounts) {
        const conv = conversationsMap.get(uc.senderId)
        if (conv) conv.unread = uc._count
      }

      return NextResponse.json({ conversations: Array.from(conversationsMap.values()) })
    }

    if (!withUserId) {
      return NextResponse.json({ error: 'Paramètre "with" requis' }, { status: 400 })
    }

    // Get conversation with a specific user
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: withUserId },
          { senderId: withUserId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Mark as read
    await prisma.message.updateMany({
      where: { senderId: withUserId, receiverId: user.id, readAt: null },
      data: { readAt: new Date() },
    })

    return NextResponse.json({ messages })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
