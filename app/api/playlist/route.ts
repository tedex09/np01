import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { XtreamService } from '@/lib/services/xtream';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, username, password } = await req.json();

    // Validate the Xtream connection
    const xtreamService = new XtreamService(url, { username, password });
    try {
      await xtreamService.getLiveStreams();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Xtream credentials' },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Store encrypted credentials
    user.setXtreamCredentials(username, password);
    user.xtreamUrl = url;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Playlist error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}