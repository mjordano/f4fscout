import { NextResponse } from 'next/server';
import { searchByHashtag } from '@/lib/instagram';
import { scoreProfiles } from '@/lib/scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { hashtag, count = 60 } = await request.json();
    if (!hashtag) return NextResponse.json({ error: 'Missing hashtag' }, { status: 400 });

    const profiles = await searchByHashtag(hashtag, count);
    const scored   = scoreProfiles(profiles);

    return NextResponse.json({
      success: true,
      profiles: scored,
      total: scored.length,
      hashtag,
      isDemo: !process.env.RAPIDAPI_KEY,
    });
  } catch (err) {
    console.error('[hashtag]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
