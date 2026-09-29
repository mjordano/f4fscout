import { NextResponse } from 'next/server';
import { searchByNiche, extractAuthHeaders } from '@/lib/instagram';
import { scoreProfiles } from '@/lib/scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { keyword, count = 80 } = await request.json();
    if (!keyword) return NextResponse.json({ error: 'Missing keyword' }, { status: 400 });

    const opts = extractAuthHeaders(request);
    const profiles = await searchByNiche(keyword, count, opts);
    const scored   = scoreProfiles(profiles);

    return NextResponse.json({
      success: true,
      profiles: scored,
      total: scored.length,
      keyword,
      isDemo: !(opts.apifyToken || opts.apiKey || process.env.APIFY_TOKEN || process.env.RAPIDAPI_KEY),
    });
  } catch (err) {
    console.error('[niche]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
