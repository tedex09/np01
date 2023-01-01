import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ActivationCode from '@/lib/models/ActivationCode';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();

    // Generate activation code for TV
    const activationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Check if code already exists
    const existingCode = await ActivationCode.findOne({ code: activationCode });
    if (existingCode) {
      return NextResponse.json(
        { error: 'Please try again' },
        { status: 409 }
      );
    }
    
    // Store the code (expires in 24 hours)
    const code = new ActivationCode({
      code: activationCode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isActivated: false
    });
    await code.save();

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
    
    // Use lean() for better performance since we don't need a full Mongoose document
    const activationCode = await ActivationCode.findOne({
      code,
      expiresAt: { $gt: new Date() }
    }).lean();

    if (!activationCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }

    return NextResponse.json({ 
      valid: true,
      isActivated: activationCode.isActivated,
      userId: activationCode.userId
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { code, email, password } = await req.json();

    if (!code || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    // Find and validate activation code
    const activationCode = await ActivationCode.findOne({
      code,
      expiresAt: { $gt: new Date() }
    });

    if (!activationCode) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }

    if (activationCode.isActivated) {
      return NextResponse.json({ error: 'Code already activated' }, { status: 400 });
    }

    // Find or create user
    let user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      // Create new user
      user = new User({
        email,
        password, // Will be hashed by the User model pre-save hook
        profiles: []
      });
      await user.save();
    } else {
      // Verify password for existing user
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    }

    // Activate the code and link it to the user
    activationCode.isActivated = true;
    activationCode.userId = user._id;
    await activationCode.save();

    return NextResponse.json({ 
      success: true,
      user: {
        id: user._id,
        email: user.email,
        profiles: user.profiles
      }
    });
  } catch (error) {
    console.error('Activation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}