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
  const data = await rateLimitedFetch(`https://${host}/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`, key, host);
  return normalizeProfile(data?.data || data);
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
  const data = await rateLimitedFetch(`https://${host}/v1/followers?username_or_id_or_url=${encodeURIComponent(username)}&count=${count}`, key, host);
  return (data?.data?.items || []).map(normalizeProfile);
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
  const data = await rateLimitedFetch(`https://${host}/v1/following?username_or_id_or_url=${encodeURIComponent(username)}&count=${count}`, key, host);
  return (data?.data?.items || []).map(normalizeProfile);
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
  const posts = data?.data?.items || [];
  const profiles = posts.slice(0, count).map(p => p.user || p.owner).filter(Boolean);
  return [...new Map(profiles.map(p => [p.pk || p.id, p])).values()].map(normalizeProfile);
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
  const data = await rateLimitedFetch(`https://${host}/v1/search_users?search_query=${encodeURIComponent(keyword)}&count=${count}`, key, host);
  return (data?.data?.items || data?.users || []).slice(0, count).map(normalizeProfile);
}

/**
 * Normalize raw API profile to our internal shape.
 */
function normalizeProfile(raw) {
  if (!raw) return null;
  const followers = raw.follower_count ?? raw.followers_count ?? raw.edge_followed_by?.count ?? 0;
  const following = raw.following_count ?? raw.edge_follow?.count ?? 0;
  return {
    id:            raw.pk || raw.id || raw.username,
    username:      raw.username || '',
    displayName:   raw.full_name || raw.name || raw.username || '',
    bio:           raw.biography || raw.bio || '',
    profilePicUrl: raw.profile_pic_url || raw.profile_picture_url || raw.hd_profile_pic_url || '',
    followers,
    following,
    postCount:     raw.media_count ?? raw.post_count ?? 0,
    isVerified:    raw.is_verified || false,
    isPrivate:     raw.is_private || false,
    isBusiness:    raw.is_business_account || raw.is_business || false,
    category:      raw.category || raw.category_name || '',
    externalUrl:   raw.external_url || '',
    lastPostDate:  raw.last_post_date || null,
    profileUrl:    `https://instagram.com/${raw.username}`,
  };
}
