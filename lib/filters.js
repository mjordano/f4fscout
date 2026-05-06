/**
 * Client-side filter and sort engine for profile results.
 */

export const DEFAULT_FILTERS = {
  minFollowers:    0,
  maxFollowers:    10000000,
  minFollowing:    0,
  maxFollowing:    10000000,
  minRatio:        0,       // min following:followers ratio
  minScore:        0,       // min F4F score
  accountTypes:    [],      // ['Personal','Business','Creator']
  includeVerified: true,
  includePrivate:  true,
  includeBusiness: true,
  minPosts:        0,
  maxPosts:        100000,
  activeWithinDays: 365,    // last active within N days
  bioKeywords:     '',      // comma-separated keywords to match in bio
  hasProfilePic:   false,
  minEngagement:   0,       // min engagement rate %
};

export const SORT_OPTIONS = [
  { value: 'score_desc',     label: '🎯 F4F Score (Highest)',       icon: '🎯' },
  { value: 'ratio_desc',     label: '📈 Following Ratio (Highest)', icon: '📈' },
  { value: 'ratio_asc',      label: '📉 Following Ratio (Lowest)',  icon: '📉' },
  { value: 'engagement_desc',label: '💬 Engagement (Highest)',      icon: '💬' },
  { value: 'followers_asc',  label: '👥 Followers (Fewest)',        icon: '👥' },
  { value: 'followers_desc', label: '👥 Followers (Most)',          icon: '👥' },
  { value: 'activity_desc',  label: '⚡ Recently Active',           icon: '⚡' },
  { value: 'niche_desc',     label: '🎨 Niche Relevance',          icon: '🎨' },
  { value: 'posts_desc',     label: '📸 Most Posts',               icon: '📸' },
  { value: 'posts_asc',      label: '📸 Fewest Posts',             icon: '📸' },
];

/**
 * Apply filters to a profile list.
 */
export function applyFilters(profiles, filters = {}) {
  const f = { ...DEFAULT_FILTERS, ...filters };

  return profiles.filter(p => {
    // Follower range
    if (p.followers < f.minFollowers || p.followers > f.maxFollowers) return false;

    // Following range
    if (p.following < f.minFollowing || p.following > f.maxFollowing) return false;

    // Following ratio
    if (f.minRatio > 0) {
      const ratio = p.followers > 0 ? p.following / p.followers : 0;
      if (ratio < f.minRatio) return false;
    }

    // Min F4F score
    if (p.score !== undefined && p.score < f.minScore) return false;

    // Verified filter
    if (!f.includeVerified && p.isVerified) return false;

    // Private filter
    if (!f.includePrivate && p.isPrivate) return false;

    // Business filter
    if (!f.includeBusiness && p.isBusiness) return false;

    // Post count
    if (p.postCount < f.minPosts || p.postCount > f.maxPosts) return false;

    // Activity (days since last post)
    if (p.lastPostDate && f.activeWithinDays < 365) {
      const daysAgo = (Date.now() - new Date(p.lastPostDate).getTime()) / 86400000;
      if (daysAgo > f.activeWithinDays) return false;
    }

    // Bio keywords
    if (f.bioKeywords) {
      const keywords = f.bioKeywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
      const bio = (p.bio || '').toLowerCase();
      const username = (p.username || '').toLowerCase();
      const matchesAny = keywords.some(kw => bio.includes(kw) || username.includes(kw));
      if (!matchesAny) return false;
    }

    // Has profile pic
    if (f.hasProfilePic && !p.profilePicUrl) return false;

    // Min engagement
    if (f.minEngagement > 0) {
      const eng = p.engagementRate || 0;
      if (eng < f.minEngagement) return false;
    }

    return true;
  });
}

/**
 * Sort a profile list by the selected sort option.
 */
export function applySort(profiles, sortOption = 'score_desc') {
  const sorted = [...profiles];

  switch (sortOption) {
    case 'score_desc':
      sorted.sort((a, b) => (b.score || 0) - (a.score || 0));
      break;
    case 'ratio_desc':
      sorted.sort((a, b) => {
        const ra = a.followers > 0 ? a.following / a.followers : 0;
        const rb = b.followers > 0 ? b.following / b.followers : 0;
        return rb - ra;
      });
      break;
    case 'ratio_asc':
      sorted.sort((a, b) => {
        const ra = a.followers > 0 ? a.following / a.followers : 0;
        const rb = b.followers > 0 ? b.following / b.followers : 0;
        return ra - rb;
      });
      break;
    case 'engagement_desc':
      sorted.sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
      break;
    case 'followers_asc':
      sorted.sort((a, b) => a.followers - b.followers);
      break;
    case 'followers_desc':
      sorted.sort((a, b) => b.followers - a.followers);
      break;
    case 'activity_desc':
      sorted.sort((a, b) => {
        const da = a.lastPostDate ? new Date(a.lastPostDate).getTime() : 0;
        const db = b.lastPostDate ? new Date(b.lastPostDate).getTime() : 0;
        return db - da;
      });
      break;
    case 'niche_desc':
      sorted.sort((a, b) => (b.nicheRelevance || 0) - (a.nicheRelevance || 0));
      break;
    case 'posts_desc':
      sorted.sort((a, b) => b.postCount - a.postCount);
      break;
    case 'posts_asc':
      sorted.sort((a, b) => a.postCount - b.postCount);
      break;
    default:
      break;
  }

  return sorted;
}

/**
 * Count how many active filters differ from defaults.
 */
export function countActiveFilters(filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  let count = 0;
  if (f.minFollowers > 0)       count++;
  if (f.maxFollowers < 10000000) count++;
  if (f.minFollowing > 0)       count++;
  if (f.maxFollowing < 10000000) count++;
  if (f.minRatio > 0)           count++;
  if (f.minScore > 0)           count++;
  if (!f.includeVerified)       count++;
  if (!f.includePrivate)        count++;
  if (!f.includeBusiness)       count++;
  if (f.minPosts > 0)           count++;
  if (f.maxPosts < 100000)      count++;
  if (f.activeWithinDays < 365) count++;
  if (f.bioKeywords)            count++;
  if (f.hasProfilePic)          count++;
  if (f.minEngagement > 0)      count++;
  return count;
}
