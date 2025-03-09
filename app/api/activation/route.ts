import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    // Generate activation code for TV
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Store the code temporarily (expires in 30 minutes)
    await connectDB();
    const user = new User({
      activationCode: {
        code: activationCode,
        expiresAt: new Date(Date.now() + 30 * 60000) // 30 minutes
      }
    });
    await user.save();

    return NextResponse.json({ activationCode });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({
      'activationCode.code': code,
      'activationCode.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}