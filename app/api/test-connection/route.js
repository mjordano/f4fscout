import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/instagram';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const apiKey = request.headers.get('x-client-api-key') || '';
    const apiHost = request.headers.get('x-client-api-host') || '';
    const opts = { apiKey, apiHost };

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 400 });
    }
    if (!apiHost) {
      return NextResponse.json({ error: 'Missing API Host' }, { status: 400 });
    }

    // Attempt to fetch profile for 'instagram' to test key and host
    const profile = await getProfile('instagram', opts);

    if (profile && (profile.username || profile.id)) {
      return NextResponse.json({
        success: true,
        isDemo: false,
        profile,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No profile data returned. Check key, host, and subscription tier.',
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
