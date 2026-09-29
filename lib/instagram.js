/**
 * Instagram API client — supports Apify Actors and RapidAPI Instagram Scrapers.
 * Falls back to mock data if neither API key/token is configured.
 */

export function extractAuthHeaders(request) {
  const provider    = request.headers.get('x-client-provider') || '';
  const apifyToken  = request.headers.get('x-client-apify-token') || '';
  const apifyActor  = request.headers.get('x-client-apify-actor') || '';
  const apiKey      = request.headers.get('x-client-api-key') || '';
  const apiHost     = request.headers.get('x-client-api-host') || '';
  return { provider, apifyToken, apifyActor, apiKey, apiHost };
}

function getAuth(opts = {}) {
  const provider = opts?.provider || (process.env.APIFY_TOKEN ? 'apify' : (opts?.apifyToken ? 'apify' : (process.env.RAPIDAPI_KEY || opts?.apiKey ? 'rapidapi' : 'demo')));
  const apifyToken = opts?.apifyToken || process.env.APIFY_TOKEN || '';
  const apifyActor = opts?.apifyActor || process.env.APIFY_ACTOR_ID || 'w0pct4EQqHEnWRnj8';
  const rapidApiKey = opts?.apiKey || process.env.RAPIDAPI_KEY || '';
  const rapidApiHost = opts?.apiHost || process.env.RAPIDAPI_HOST || 'instagram-scraper-api2.p.rapidapi.com';

  const isDemo = provider === 'apify' ? !apifyToken : (!rapidApiKey && !apifyToken);

  return {
    provider: apifyToken ? 'apify' : (rapidApiKey ? 'rapidapi' : 'demo'),
    apifyToken,
    apifyActor,
    rapidApiKey,
    rapidApiHost,
    isDemo,
  };
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
  if (!res.ok) {
    console.error(`[API ERROR] ${url} -> ${res.status} ${res.statusText}`);
    throw new Error(`RapidAPI error ${res.status}: ${res.statusText}`);
  }
  const json = await res.json();
  return json;
}

/**
 * Apify run-sync-get-dataset-items call.
 */
async function apifyFetch(actorId, token, input) {
  const encodedActor = encodeURIComponent(actorId);
  const url = `https://api.apify.com/v2/acts/${encodedActor}/run-sync-get-dataset-items?token=${token}&timeout=60`;
  
  console.log(`[APIFY CALL] Running actor ${actorId} with input:`, JSON.stringify(input));
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error(`[APIFY ERROR] ${res.status} ${res.statusText}:`, errText);
    throw new Error(`Apify error ${res.status}: ${res.statusText} ${errText ? `(${errText.slice(0, 150)})` : ''}`);
  }

  const items = await res.json();
  const arr = Array.isArray(items) ? items : [items];
  console.log(`[APIFY SUCCESS] Received ${arr.length} items. Sample item:`, JSON.stringify(arr[0] || {}, null, 2));
  return arr;
}

/**
 * Get basic profile info for a username.
 */
export async function getProfile(username, opts = {}) {
  const auth = getAuth(opts);
  if (auth.isDemo) {
    const { generateMockProfile } = await import('./mockData.js');
    return generateMockProfile(username);
  }

  // 1. Apify integration
  if (auth.provider === 'apify' && auth.apifyToken) {
    try {
      const items = await apifyFetch(auth.apifyActor, auth.apifyToken, {
        usernames: [username],
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsLimit: 1,
      });
      if (items.length > 0) {
        const p = normalizeProfile(items[0]);
        if (p) return p;
      }
    } catch (e) {
      console.warn('[Apify getProfile failed]:', e.message);
      if (!auth.rapidApiKey) throw e;
    }
  }

  // 2. RapidAPI fallback
  const { rapidApiKey: key, rapidApiHost: host } = auth;
  const paths = [
    `/v1/info?username_or_id_or_url=${encodeURIComponent(username)}`,
    `/v1/info?username=${encodeURIComponent(username)}`,
    `/info?username=${encodeURIComponent(username)}`,
    `/user/info?username=${encodeURIComponent(username)}`,
    `/profile?username=${encodeURIComponent(username)}`,
    `/profile?user=${encodeURIComponent(username)}`,
    `/profile2?username=${encodeURIComponent(username)}`,
    `/clients/api/ig/profile?user=${encodeURIComponent(username)}`,
    `/user?username=${encodeURIComponent(username)}`
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
 */
export async function getFollowers(username, count = 80, opts = {}) {
  const auth = getAuth(opts);
  if (auth.isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, username, 'followers');
  }

  if (auth.provider === 'apify' && auth.apifyToken) {
    try {
      const items = await apifyFetch(auth.apifyActor, auth.apifyToken, {
        usernames: [username],
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsLimit: count,
        searchType: 'followers',
      });
      if (items.length > 0) {
        return items.map(normalizeProfile).filter(Boolean);
      }
    } catch (e) {
      console.warn('[Apify getFollowers failed]:', e.message);
      if (!auth.rapidApiKey) throw e;
    }
  }

  const { rapidApiKey: key, rapidApiHost: host } = auth;
  const paths = [
    `/v1/followers?username_or_id_or_url=${encodeURIComponent(username)}&count=${count}`,
    `/v1/followers?username=${encodeURIComponent(username)}&count=${count}`,
    `/followers?username=${encodeURIComponent(username)}&count=${count}`,
    `/user/followers?username=${encodeURIComponent(username)}&count=${count}`,
    `/followers?username=${encodeURIComponent(username)}`,
    `/profile/followers?username=${encodeURIComponent(username)}`,
    `/clients/api/ig/followers?user=${encodeURIComponent(username)}&count=${count}`,
    `/clients/api/ig/followers?user=${encodeURIComponent(username)}`,
    `/followers?user=${encodeURIComponent(username)}&count=${count}`
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
export async function getFollowing(username, count = 80, opts = {}) {
  const auth = getAuth(opts);
  if (auth.isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, username, 'following');
  }

  if (auth.provider === 'apify' && auth.apifyToken) {
    try {
      const items = await apifyFetch(auth.apifyActor, auth.apifyToken, {
        usernames: [username],
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsLimit: count,
        searchType: 'following',
      });
      if (items.length > 0) {
        return items.map(normalizeProfile).filter(Boolean);
      }
    } catch (e) {
      console.warn('[Apify getFollowing failed]:', e.message);
      if (!auth.rapidApiKey) throw e;
    }
  }

  const { rapidApiKey: key, rapidApiHost: host } = auth;
  const paths = [
    `/v1/following?username_or_id_or_url=${encodeURIComponent(username)}&count=${count}`,
    `/v1/following?username=${encodeURIComponent(username)}&count=${count}`,
    `/following?username=${encodeURIComponent(username)}&count=${count}`,
    `/user/following?username=${encodeURIComponent(username)}&count=${count}`,
    `/following?username=${encodeURIComponent(username)}`,
    `/profile/following?username=${encodeURIComponent(username)}`,
    `/clients/api/ig/following?user=${encodeURIComponent(username)}&count=${count}`,
    `/clients/api/ig/following?user=${encodeURIComponent(username)}`,
    `/following?user=${encodeURIComponent(username)}&count=${count}`
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
  const auth = getAuth(opts);
  const tag = hashtag.replace('#', '');
  if (auth.isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, hashtag, 'hashtag');
  }

  if (auth.provider === 'apify' && auth.apifyToken) {
    try {
      const items = await apifyFetch(auth.apifyActor, auth.apifyToken, {
        hashtags: [tag],
        resultsLimit: count,
        searchType: 'hashtag',
      });
      if (items.length > 0) {
        const profiles = items.map(p => p.owner || p.user || p.node?.owner || p).filter(p => p && (p.username || p.pk || p.id));
        if (profiles.length > 0) {
          return [...new Map(profiles.map(p => [p.pk || p.id || p.username, p])).values()].map(normalizeProfile).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('[Apify searchByHashtag failed]:', e.message);
      if (!auth.rapidApiKey) throw e;
    }
  }

  const { rapidApiKey: key, rapidApiHost: host } = auth;
  const paths = [
    `/v1/hashtag?hashtag=${encodeURIComponent(tag)}`,
    `/hashtag?hashtag=${encodeURIComponent(tag)}`,
    `/hashtag/media?hashtag=${encodeURIComponent(tag)}`,
    `/clients/api/ig/hashtag?hashtag=${encodeURIComponent(tag)}`
  ];

  for (const path of paths) {
    try {
      const data = await rateLimitedFetch(`https://${host}${path}`, key, host);
      const items = data?.data?.items || data?.items || data?.data?.sections || data?.results || [];
      if (items.length > 0) {
        const profiles = items.map(p => p.node?.owner || p.user || p.owner || p).filter(p => p && (p.username || p.pk || p.id));
        if (profiles.length > 0) {
          return [...new Map(profiles.map(p => [p.pk || p.id || p.username, p])).values()].map(normalizeProfile).filter(Boolean);
        }
      }
    } catch (e) { continue; }
  }
  return [];
}

/**
 * Search profiles by keyword/niche/location.
 */
export async function searchByNiche(keyword, count = 80, opts = {}) {
  const auth = getAuth(opts);
  if (auth.isDemo) {
    const { generateMockProfiles } = await import('./mockData.js');
    return generateMockProfiles(count, keyword, 'niche');
  }

  if (auth.provider === 'apify' && auth.apifyToken) {
    try {
      const items = await apifyFetch(auth.apifyActor, auth.apifyToken, {
        search: keyword,
        searchType: 'user',
        resultsLimit: count,
      });
      if (items.length > 0) {
        const profiles = items.map(p => p.user || p.owner || p).filter(p => p && (p.username || p.pk || p.id));
        if (profiles.length > 0) {
          return profiles.slice(0, count).map(normalizeProfile).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('[Apify searchByNiche failed]:', e.message);
      if (!auth.rapidApiKey) throw e;
    }
  }

  const { rapidApiKey: key, rapidApiHost: host } = auth;
  const paths = [
    `/v1/search_users?search_query=${encodeURIComponent(keyword)}&count=${count}`,
    `/search?query=${encodeURIComponent(keyword)}&count=${count}`,
    `/user/search?query=${encodeURIComponent(keyword)}&count=${count}`,
    `/search?query=${encodeURIComponent(keyword)}`,
    `/v1/search_users?search_query=${encodeURIComponent(keyword)}`,
    `/clients/api/ig/search?query=${encodeURIComponent(keyword)}`,
    `/search_users?search_query=${encodeURIComponent(keyword)}`,
    `/search?q=${encodeURIComponent(keyword)}`
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
 * Enrich lightweight profiles (e.g. from follower list) with full metrics (followers, following, posts, bio).
 */
export async function enrichProfilesWithDetails(profiles, opts = {}, limit = 30) {
  if (!Array.isArray(profiles) || profiles.length === 0) return profiles;

  const auth = getAuth(opts);
  if (auth.isDemo) return profiles;

  // Check if profiles need enrichment (missing followers and following numbers)
  const needsEnrichment = profiles.filter(p => !p.followers && !p.following && p.username);
  if (needsEnrichment.length === 0) return profiles;

  const targetBatch = needsEnrichment.slice(0, limit);
  const usernames = targetBatch.map(p => p.username);

  console.log(`[ENRICHMENT] Enriching full profile details for ${usernames.length} accounts...`);

  try {
    if (auth.provider === 'apify' && auth.apifyToken) {
      const items = await apifyFetch(auth.apifyActor, auth.apifyToken, {
        usernames: usernames,
        directUrls: usernames.map(u => `https://www.instagram.com/${u}/`),
        resultsLimit: usernames.length,
      });

      const detailsMap = new Map();
      items.forEach(item => {
        const norm = normalizeProfile(item);
        if (norm && norm.username) {
          detailsMap.set(norm.username.toLowerCase(), norm);
        }
      });

      return profiles.map(p => {
        const details = detailsMap.get((p.username || '').toLowerCase());
        if (details && (details.followers > 0 || details.following > 0 || details.postCount > 0)) {
          return {
            ...p,
            ...details,
            // Keep original profile pic if details didn't provide a higher quality one
            profilePicUrl: details.profilePicUrl || p.profilePicUrl,
          };
        }
        return p;
      });
    }
  } catch (err) {
    console.warn('[ENRICHMENT FAILED, returning existing profiles]:', err.message);
  }

  return profiles;
}

/**
 * Normalize raw API / Apify profile to our internal shape.
 */
function normalizeProfile(raw) {
  if (!raw) return null;
  const data = raw.node || raw.user || raw.data || raw.owner || raw;
  
  const username = data.username || data.ownerUsername || data.user_name || '';
  if (!username && !data.pk && !data.id && !data.userId) return null;

  // Followers count extraction
  const followers = data.followersCount 
    ?? data.follower_count 
    ?? data.followers_count 
    ?? data.followerCount 
    ?? data.followers 
    ?? data.edge_followed_by?.count 
    ?? data.subscribersCount 
    ?? 0;

  // Following count extraction
  const following = data.followsCount 
    ?? data.following_count 
    ?? data.followingCount 
    ?? data.following 
    ?? data.edge_follow?.count 
    ?? data.follows 
    ?? 0;

  // Posts count extraction
  const postsCount = data.postsCount 
    ?? data.media_count 
    ?? data.post_count 
    ?? data.postCount 
    ?? data.posts 
    ?? data.edge_owner_to_timeline_media?.count 
    ?? 0;

  // Calculate engagement / posts if available from Apify dataset
  const posts = data.latestPosts || data.posts || data.edge_owner_to_timeline_media?.edges?.map(e => e.node) || [];
  let avgLikes = 0;
  let avgComments = 0;
  let lastPostDate = data.last_post_date || data.lastPostDate || null;

  if (Array.isArray(posts) && posts.length > 0) {
    const recent = posts.slice(0, 6);
    const totalLikes = recent.reduce((sum, p) => sum + (p.likesCount ?? p.like_count ?? p.likes ?? p.edge_liked_by?.count ?? 0), 0);
    const totalComments = recent.reduce((sum, p) => sum + (p.commentsCount ?? p.comment_count ?? p.comments ?? p.edge_media_to_comment?.count ?? 0), 0);
    avgLikes = Math.round(totalLikes / recent.length);
    avgComments = Math.round(totalComments / recent.length);

    const firstTimestamp = recent[0]?.timestamp || recent[0]?.taken_at_timestamp || recent[0]?.postedAt || recent[0]?.date;
    if (firstTimestamp) {
      lastPostDate = typeof firstTimestamp === 'number' && firstTimestamp < 10000000000
        ? new Date(firstTimestamp * 1000).toISOString()
        : new Date(firstTimestamp).toISOString();
    }
  }

  const profilePic = data.profilePicUrlHD 
    || data.profilePicUrl 
    || data.profile_pic_url_hd 
    || data.profile_pic_url 
    || data.profile_picture_url 
    || data.hd_profile_pic_url 
    || data.profilePicture 
    || '';

  return {
    id:            data.pk || data.id || data.userId || username || Math.random().toString(),
    username:      username,
    displayName:   data.fullName || data.full_name || data.name || username,
    bio:           data.biography || data.bio || data.biography_with_entities?.raw_text || '',
    profilePicUrl: profilePic,
    followers:     Number(followers) || 0,
    following:     Number(following) || 0,
    postCount:     Number(postsCount) || (Array.isArray(posts) ? posts.length : 0),
    isVerified:    Boolean(data.verified ?? data.is_verified ?? data.isVerified ?? false),
    isPrivate:     Boolean(data.private ?? data.is_private ?? data.isPrivate ?? false),
    isBusiness:    Boolean(data.isBusinessAccount ?? data.is_business_account ?? data.is_business ?? data.isBusiness ?? false),
    category:      data.category || data.category_name || data.categoryName || '',
    externalUrl:   data.externalUrl || data.external_url || data.website || '',
    lastPostDate,
    avgLikesPerPost: avgLikes || data.avgLikesPerPost || 0,
    avgCommentsPerPost: avgComments || data.avgCommentsPerPost || 0,
    profileUrl:    username ? `https://instagram.com/${username}` : '#',
  };
}
