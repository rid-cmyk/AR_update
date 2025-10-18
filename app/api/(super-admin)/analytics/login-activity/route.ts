import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all users with their roles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        namaLengkap: true,
        username: true,
        role: {
          select: {
            name: true
          }
        },
        foto: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // For now, simulate active users based on recent updates
    // In a real app, you'd track actual login sessions
    const activeUsers = allUsers
      .filter(user => {
        const lastActivity = new Date(user.updatedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24; // Consider active if updated in last 24 hours
      })
      .map(user => ({
        id: user.id,
        namaLengkap: user.namaLengkap,
        username: user.username,
        role: user.role.name,
        lastActivity: user.updatedAt.toISOString(),
        avatar: user.foto
      }))
      .slice(0, 10); // Return top 10 most recent

    return NextResponse.json({
      activeUsers,
      totalActive: activeUsers.length,
      totalUsers: allUsers.length
    });
  } catch (error) {
    console.error('Error fetching login activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch login activity' },
      { status: 500 }
    );
  }
}