import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Create response that clears the auth_token cookie
    const response = NextResponse.json({ message: 'Logout successful' });

    // Clear the auth_token cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}