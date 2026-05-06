import { NextResponse } from 'next/server';
import { searchByNiche } from '@/lib/instagram';
import { scoreProfiles } from '@/lib/scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { keyword, count = 80 } = await request.json();
    if (!keyword) return NextResponse.json({ error: 'Missing keyword' }, { status: 400 });

    const profiles = await searchByNiche(keyword, count);
    const scored   = scoreProfiles(profiles);

    return NextResponse.json({
      success: true,
      profiles: scored,
      total: scored.length,
      keyword,
      isDemo: !process.env.RAPIDAPI_KEY,
    });
  } catch (err) {
    console.error('[niche]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
