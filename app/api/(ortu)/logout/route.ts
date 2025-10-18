import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Logout successful'
    });

    // Clear the auth_token cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json({
      error: 'Failed to logout',
      detail: error.message
    }, { status: 500 });
  }
}
