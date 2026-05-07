import { NextResponse } from 'next/server';
import { getFollowers, getFollowing, getProfile } from '@/lib/instagram';
import { scoreProfiles } from '@/lib/scoring';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mode, usernames, username, count = 80 } = body;

    const apiKey = request.headers.get('x-client-api-key') || '';
    const apiHost = request.headers.get('x-client-api-host') || '';
    const opts = { apiKey, apiHost };

    if (!mode) {
      return NextResponse.json({ error: 'Missing mode' }, { status: 400 });
    }

    let profiles = [];
    let sourceProfile = null;

    if (mode === 'account') {
      if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

      const [profileData, followers, following] = await Promise.allSettled([
        getProfile(username, opts),
        getFollowers(username, count, opts),
        getFollowing(username, Math.floor(count / 2), opts),
      ]);

      if (profileData.status === 'fulfilled') sourceProfile = profileData.value;

      // Combine followers + following, deduplicate
      const all = [
        ...(followers.status === 'fulfilled'  ? followers.value  : []),
        ...(following.status === 'fulfilled'  ? following.value  : []),
      ];
      const seen = new Set();
      profiles = all.filter(p => p && !seen.has(p.username) && seen.add(p.username));
    }

    else if (mode === 'multi') {
      if (!Array.isArray(usernames) || usernames.length === 0) {
        return NextResponse.json({ error: 'Missing usernames array' }, { status: 400 });
      }
      const results = await Promise.allSettled(
        usernames.slice(0, 5).map(u => getFollowers(u, Math.ceil(count / usernames.length), opts))
      );
      const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
      const seen = new Set();
      profiles = all.filter(p => p && !seen.has(p.username) && seen.add(p.username));
    }

    else {
      return NextResponse.json({ error: 'Unknown mode' }, { status: 400 });
    }

    const scored = scoreProfiles(profiles);

    return NextResponse.json({
      success: true,
      profiles: scored,
      total: scored.length,
      sourceProfile,
      isDemo: !(opts.apiKey || process.env.RAPIDAPI_KEY),
    });
  } catch (err) {
    console.error('[scout]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
