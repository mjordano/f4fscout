import { NextResponse } from 'next/server';
import { getProfile, extractAuthHeaders } from '@/lib/instagram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const opts = extractAuthHeaders(request);

    if (opts.provider === 'apify' || opts.apifyToken) {
      if (!opts.apifyToken) {
        return NextResponse.json({ error: 'Missing Apify API Token' }, { status: 400 });
      }
    } else {
      if (!opts.apiKey) {
        return NextResponse.json({ error: 'Missing RapidAPI Key' }, { status: 400 });
      }
      if (!opts.apiHost) {
        return NextResponse.json({ error: 'Missing RapidAPI Host' }, { status: 400 });
      }
    }

    // Attempt to fetch profile for 'instagram' to test key/token and provider
    const profile = await getProfile('instagram', opts);

    if (profile && (profile.username || profile.id)) {
      return NextResponse.json({
        success: true,
        isDemo: false,
        provider: opts.provider || (opts.apifyToken ? 'apify' : 'rapidapi'),
        profile,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No profile data returned. Check credentials and actor/endpoint status.',
      }, { status: 400 });
    }
  } catch (err) {
    console.error('[test-connection]', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal connection error',
    }, { status: 500 });
  }
}
