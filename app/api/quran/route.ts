import { NextResponse } from 'next/server';

// In-memory storage for demo (in production, use database)
let userBookmarks: Array<{
  id: string;
  userId: string;
  type: 'page' | 'ayat' | 'juz';
  reference: {
    page?: number;
    suratId?: number;
    ayatNumber?: number;
    juz?: number;
  };
  note?: string;
  createdAt: string;
}> = [];

let userProgress: Array<{
  userId: string;
  suratId: number;
  ayatNumber: number;
  status: 'memorized' | 'reviewing' | 'target';
  lastUpdated: string;
}> = [];

import { JUZ_TO_PAGE_MAPPING, SURAT_DATA, generateMushafPageContent } from './quranUtils';
import { handleSearch, handleAyatRequest } from './quranHandlers';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const suratId = searchParams.get('suratId');
    const page = searchParams.get('page');
    const juz = searchParams.get('juz');
    const action = searchParams.get('action');
    const search = searchParams.get('search');
    const ayat = searchParams.get('ayat');

    // Handle search functionality
    if (action === 'search' && search) {
      return handleSearch(search);
    }

    // Handle ayat-specific requests
    if (action === 'ayat' && suratId && ayat) {
      return handleAyatRequest(parseInt(suratId), parseInt(ayat));
    }

    // Handle mushaf-specific requests
    if (action === 'mushaf') {
      if (page) {
        // Get specific mushaf page
        const pageNum = parseInt(page);
        if (pageNum < 1 || pageNum > 604) {
          return NextResponse.json(
            { error: 'Invalid page number. Must be between 1-604' },
            { status: 400 }
          );
        }
        
        const pageContent = generateMushafPageContent(pageNum);
        return NextResponse.json({
          success: true,
          data: pageContent
        });
      }
      
      if (juz) {
        // Get juz page range and detailed info
        const juzNum = parseInt(juz);
        if (juzNum < 1 || juzNum > 30) {
          return NextResponse.json(
            { error: 'Invalid juz number. Must be between 1-30' },
            { status: 400 }
          );
        }
        
        const juzMapping = JUZ_TO_PAGE_MAPPING[juzNum as keyof typeof JUZ_TO_PAGE_MAPPING];
        const suratsInJuz = Object.entries(SURAT_DATA).filter(([, surat]) => {
          return Array.isArray(surat.juz) ? surat.juz.includes(juzNum) : surat.juz === juzNum;
        });

        return NextResponse.json({
          success: true,
          data: {
            juz: juzNum,
            pageRange: juzMapping,
            totalPages: juzMapping.end - juzMapping.start + 1,
            surats: suratsInJuz.map(([id, surat]) => ({
              id: parseInt(id),
              name: surat.name,
              arabicName: surat.arabicName,
              totalAyat: surat.totalAyat
            })),
            navigation: {
              previousJuz: juzNum > 1 ? juzNum - 1 : null,
              nextJuz: juzNum < 30 ? juzNum + 1 : null
            }
          }
        });
      }
      
      // Return complete mushaf overview
      return NextResponse.json({
        success: true,
        data: {
          juzMapping: JUZ_TO_PAGE_MAPPING,
          totalPages: 604,
          totalJuz: 30,
          totalSurats: Object.keys(SURAT_DATA).length,
          suratList: Object.entries(SURAT_DATA).map(([id, surat]) => ({
            id: parseInt(id),
            name: surat.name,
            arabicName: surat.arabicName,
            totalAyat: surat.totalAyat,
            juz: surat.juz,
            pages: surat.pages
          }))
        }
      });
    }

    // Handle surat list with enhanced data
    if (action === 'surats') {
      return NextResponse.json({
        success: true,
        data: Object.entries(SURAT_DATA).map(([id, surat]) => ({
          id: parseInt(id),
          name: surat.name,
          arabicName: surat.arabicName,
          totalAyat: surat.totalAyat,
          juz: surat.juz,
          pages: surat.pages,
          pageCount: surat.pages[1] - surat.pages[0] + 1
        }))
      });
    }

    // Original Quran API functionality with fallback to external API
    if (suratId) {
      // Try to get from local data first
      const localSurat = SURAT_DATA[parseInt(suratId) as keyof typeof SURAT_DATA];
      if (localSurat) {
        return NextResponse.json({
          success: true,
          data: {
            id: parseInt(suratId),
            ...localSurat,
            source: 'local'
          }
        });
      }

      // Fallback to external API
      const response = await fetch(`https://equran.id/api/v2/surat/${suratId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch surat data');
      }
      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: { ...data, source: 'external' }
      });
    } else {
      // Get all surat list from external API
      const response = await fetch('https://equran.id/api/v2/surat');
      if (!response.ok) {
        throw new Error('Failed to fetch surat list');
      }
      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: { ...data, source: 'external' }
      });
    }
  } catch (error) {
    console.error('Error fetching Quran data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Quran data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


// POST endpoint for bookmarks and progress tracking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'bookmark':
        return handleBookmark(userId, data);
      
      case 'progress':
        return handleProgress(userId, data);
      
      case 'get-bookmarks':
        return getBookmarks(userId);
      
      case 'get-progress':
        return getProgress(userId, data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in POST /api/quran:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle bookmark creation
async function handleBookmark(userId: string, data: Record<string, unknown>) {
  const { type, reference, note } = data;
  
  if (!type || !reference) {
    return NextResponse.json(
      { error: 'Type and reference are required' },
      { status: 400 }
    );
  }

  const bookmark = {
    id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    reference,
    note: note || '',
    createdAt: new Date().toISOString()
  };

  userBookmarks.push(bookmark as any);

  return NextResponse.json({
    success: true,
    data: bookmark,
    message: 'Bookmark created successfully'
  });
}

// Handle progress tracking
async function handleProgress(userId: string, data: Record<string, unknown>) {
  const { suratId, ayatNumber, status } = data;
  
  if (!suratId || !ayatNumber || !status) {
    return NextResponse.json(
      { error: 'SuratId, ayatNumber, and status are required' },
      { status: 400 }
    );
  }

  // Remove existing progress for this ayat
  userProgress = userProgress.filter(p => 
    !(p.userId === userId && p.suratId === suratId && p.ayatNumber === ayatNumber)
  );

  // Add new progress
  const progress = {
    userId,
    suratId,
    ayatNumber,
    status,
    lastUpdated: new Date().toISOString()
  };

  userProgress.push(progress as any);

  return NextResponse.json({
    success: true,
    data: progress,
    message: 'Progress updated successfully'
  });
}

// Get user bookmarks
async function getBookmarks(userId: string) {
  const bookmarks = userBookmarks.filter(b => b.userId === userId);
  
  return NextResponse.json({
    success: true,
    data: bookmarks,
    total: bookmarks.length
  });
}

// Get user progress
async function getProgress(userId: string, filters?: Record<string, unknown>) {
  let progress = userProgress.filter(p => p.userId === userId);
  
  if (filters?.suratId) {
    progress = progress.filter(p => p.suratId === filters.suratId);
  }
  
  if (filters?.status) {
    progress = progress.filter(p => p.status === filters.status);
  }

  // Calculate statistics
  const stats = {
    total: progress.length,
    memorized: progress.filter(p => p.status === 'memorized').length,
    reviewing: progress.filter(p => p.status === 'reviewing').length,
    target: progress.filter(p => p.status === 'target').length
  };

  return NextResponse.json({
    success: true,
    data: progress,
    stats,
    total: progress.length
  });
}

// PUT endpoint for updating bookmarks/progress
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, id, data } = body;

    if (!userId || !id) {
      return NextResponse.json(
        { error: 'User ID and item ID are required' },
        { status: 400 }
      );
    }

    if (action === 'update-bookmark') {
      const bookmarkIndex = userBookmarks.findIndex(b => b.id === id && b.userId === userId);
      
      if (bookmarkIndex === -1) {
        return NextResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        );
      }

      userBookmarks[bookmarkIndex] = {
        ...userBookmarks[bookmarkIndex],
        ...data,
        lastUpdated: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        data: userBookmarks[bookmarkIndex],
        message: 'Bookmark updated successfully'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PUT /api/quran:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint for removing bookmarks
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (action === 'delete-bookmark' && id) {
      const initialLength = userBookmarks.length;
      userBookmarks = userBookmarks.filter(b => !(b.id === id && b.userId === userId));
      
      if (userBookmarks.length === initialLength) {
        return NextResponse.json(
          { error: 'Bookmark not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Bookmark deleted successfully'
      });
    }

    if (action === 'clear-progress') {
      const initialLength = userProgress.length;
      userProgress = userProgress.filter(p => p.userId !== userId);
      const deletedCount = initialLength - userProgress.length;

      return NextResponse.json({
        success: true,
        message: `Cleared ${deletedCount} progress records`
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/quran:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
