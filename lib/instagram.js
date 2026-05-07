/**
 * Instagram API client — wraps RapidAPI Instagram Scraper endpoints.
 * Falls back to mock data if no RAPIDAPI_KEY is configured.
 */

function getAuth(opts) {
  const key  = opts?.apiKey  || process.env.RAPIDAPI_KEY || '';
  const host = opts?.apiHost || process.env.RAPIDAPI_HOST || 'rocketapi-for-instagram.p.rapidapi.com';
  return { key, host, isDemo: !key };
}

/** Simple rate limiter: max 1 req/650ms */
let lastCall = 0;
async function rateLimitedFetch(url, key, host) {
  const now = Date.now();
  const gap = now - lastCall;
  if (gap < 650) await new Promise(r => setTimeout(r, 650 - gap));
  lastCall = Date.now();

  const headers = { 'x-rapidapi-key': key, 'x-rapidapi-host': host };
  const res = await fetch(url, { headers, next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * Get basic profile info for a username.
 */
export async function getProfile(username, opts = {}) {
  const { key, host, isDemo } = getAuth(opts);
  if (isDemo) {
    const { generateMockProfile } = await import('./mockData.js');
    return generateMockProfile(username);
  }
  
  // Try with and without /v1/ prefix, and different param names
  const paths = [
    `/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`,
    `/info?username=${encodeURIComponent(username)}`,
    `/user/info?username=${encodeURIComponent(username)}`
  ];

  for (const path of paths) {
    try {
      const data = await rateLimitedFetch(`https://${host}${path}`, key, host);
      const raw = data?.data || data?.user || data?.profile || data;
      if (raw && (raw.username || raw.pk || raw.id)) return normalizeProfile(raw);
    } catch (e) { continue; }
  }
  return null;
}

/**
 * Get followers list for a profile.
 * @param {string} username
 * @param {number} count  — how many to fetch (capped by API tier)
 */
export async function getFollowers(username, count = 100, opts = {}) {
  const { key, host, isDemo } = getAuth(opts);
  if (isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, username, 'followers');
  }

  const paths = [
    `/v1/followers?username_or_id_or_url=${encodeURIComponent(username)}&count=${count}`,
    `/followers?username=${encodeURIComponent(username)}&count=${count}`,
    `/user/followers?username=${encodeURIComponent(username)}&count=${count}`
  ];

  for (const path of paths) {
    try {
      const data = await rateLimitedFetch(`https://${host}${path}`, key, host);
      const items = data?.data?.items || data?.items || data?.users || data?.data?.users || data?.results || [];
      if (items.length > 0) return items.map(normalizeProfile).filter(Boolean);
    } catch (e) { continue; }
  }
  return [];
}

/**
 * Get following list for a profile.
 */
export async function getFollowing(username, count = 100, opts = {}) {
  const { key, host, isDemo } = getAuth(opts);
  if (isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, username, 'following');
  }

  const paths = [
    `/v1/following?username_or_id_or_url=${encodeURIComponent(username)}&count=${count}`,
    `/following?username=${encodeURIComponent(username)}&count=${count}`,
    `/user/following?username=${encodeURIComponent(username)}&count=${count}`
  ];

  for (const path of paths) {
    try {
      const data = await rateLimitedFetch(`https://${host}${path}`, key, host);
      const items = data?.data?.items || data?.items || data?.users || data?.data?.users || data?.results || [];
      if (items.length > 0) return items.map(normalizeProfile).filter(Boolean);
    } catch (e) { continue; }
  }
  return [];
}

/**
 * Search profiles by hashtag — returns recent posters.
 */
export async function searchByHashtag(hashtag, count = 50, opts = {}) {
  const { key, host, isDemo } = getAuth(opts);
  if (isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, hashtag, 'hashtag');
  }
  const tag = hashtag.replace('#', '');
  const data = await rateLimitedFetch(`https://${host}/v1/hashtag?hashtag=${encodeURIComponent(tag)}`, key, host);
  const items = data?.data?.items || data?.items || data?.data?.sections || [];
  // For hashtags, sometimes users are nested in posts
  const profiles = items.map(p => p.user || p.owner || p).filter(p => p && (p.username || p.pk));
  return [...new Map(profiles.map(p => [p.pk || p.id || p.username, p])).values()].map(normalizeProfile);
}

/**
 * Search profiles by keyword/niche/location.
 */
export async function searchByNiche(keyword, count = 80, opts = {}) {
  const { key, host, isDemo } = getAuth(opts);
  if (isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, keyword, 'niche');
  }

  const paths = [
    `/v1/search_users?search_query=${encodeURIComponent(keyword)}&count=${count}`,
    `/search?query=${encodeURIComponent(keyword)}&count=${count}`,
    `/user/search?query=${encodeURIComponent(keyword)}&count=${count}`
  ];

  for (const path of paths) {
    try {
      const data = await rateLimitedFetch(`https://${host}${path}`, key, host);
      const items = data?.data?.items || data?.items || data?.users || data?.data?.users || data.results || [];
      if (items.length > 0) return items.slice(0, count).map(normalizeProfile).filter(Boolean);
    } catch (e) { continue; }
  }
  return [];
}

/**
 * Normalize raw API profile to our internal shape.
 */
function normalizeProfile(raw) {
  if (!raw) return null;
  // Handle nested 'node' structure common in GraphQL scrapers
  const data = raw.node || raw;
  
  const followers = data.follower_count ?? data.followers_count ?? data.edge_followed_by?.count ?? data.followers ?? 0;
  const following = data.following_count ?? data.edge_follow?.count ?? data.following ?? 0;
  
  return {
    id:            data.pk || data.id || data.username || Math.random().toString(),
    username:      data.username || '',
    displayName:   data.full_name || data.name || data.username || '',
    bio:           data.biography || data.bio || '',
    profilePicUrl: data.profile_pic_url || data.profile_picture_url || data.hd_profile_pic_url || '',
    followers,
    following,
    postCount:     data.media_count ?? data.post_count ?? data.edge_owner_to_timeline_media?.count ?? 0,
    isVerified:    data.is_verified || false,
    isPrivate:     data.is_private || false,
    isBusiness:    data.is_business_account || data.is_business || false,
    category:      data.category || data.category_name || '',
    externalUrl:   data.external_url || '',
    lastPostDate:  data.last_post_date || null,
    profileUrl:    data.username ? `https://instagram.com/${data.username}` : '#',
  };
}
