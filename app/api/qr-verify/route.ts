import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import NodeCache from 'node-cache';

const qrCache = new NodeCache({ stdTTL: 300 }); // 5 minutes TTL

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    
    // Store QR session
    qrCache.set(sessionId, {
      verified: false,
      createdAt: Date.now()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR session creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = qrCache.get(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 404 });
    }

    return NextResponse.json({ verified: session.verified });
  } catch (error) {
    console.error('QR verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    const qrSession = qrCache.get(sessionId);

    if (!qrSession) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 404 });
    }

    qrCache.set(sessionId, {
      ...qrSession,
      verified: true
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('QR verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}