/**
 * F4F Score algorithm — scores profiles 0-100 on likelihood of following back.
 */

const WEIGHTS = {
  ratio:      0.40,  // Following:Followers ratio (biggest signal)
  engagement: 0.20,  // Engagement rate
  activity:   0.20,  // How recently they posted
  niche:      0.15,  // Niche relevance
  size:       0.05,  // Account size (smaller = more likely to follow back)
};

/**
 * Normalize a value to 0-1 range with soft clamping.
 */
function normalize(value, min, max, invert = false) {
  const clamped = Math.min(Math.max(value, min), max);
  const norm    = (clamped - min) / (max - min);
  return invert ? 1 - norm : norm;
}

/**
 * Score the following:followers ratio.
 * A 2:1 ratio (follows 2x more than followers) = very high score.
 * A 0.1:1 ratio (celeb) = very low score.
 */
function scoreRatio(following, followers) {
  if (followers === 0) return following > 0 ? 0.9 : 0.3;
  const ratio = following / followers;
  // Sigmoid-like: ratio of 0.5 → ~0.3, ratio of 1.0 → ~0.5, ratio of 2.0 → ~0.8, ratio of 5.0 → ~0.95
  if (ratio < 0.1) return 0.02;
  if (ratio < 0.5) return normalize(ratio, 0.1, 0.5) * 0.3;
  if (ratio < 1.0) return 0.3 + normalize(ratio, 0.5, 1.0) * 0.2;
  if (ratio < 2.0) return 0.5 + normalize(ratio, 1.0, 2.0) * 0.3;
  if (ratio < 5.0) return 0.8 + normalize(ratio, 2.0, 5.0) * 0.15;
  return 0.95;
}

/**
 * Score engagement rate (%). Higher is better, but diminishing returns.
 * Typical: 1-3% = average, 5%+ = high, 10%+ = exceptional.
 */
function scoreEngagement(engagementRate) {
  if (!engagementRate || engagementRate <= 0) return 0.2;
  if (engagementRate < 1)  return 0.2 + normalize(engagementRate, 0, 1) * 0.1;
  if (engagementRate < 3)  return 0.3 + normalize(engagementRate, 1, 3) * 0.3;
  if (engagementRate < 7)  return 0.6 + normalize(engagementRate, 3, 7) * 0.3;
  return 0.9 + normalize(engagementRate, 7, 15, false) * 0.1;
}

/**
 * Score activity: how recently they posted.
 * Recent activity = likely to be active on platform = more likely to follow back.
 */
function scoreActivity(lastPostDate) {
  if (!lastPostDate) return 0.3;
  const daysAgo = (Date.now() - new Date(lastPostDate).getTime()) / 86400000;
  if (daysAgo < 1)   return 1.0;
  if (daysAgo < 3)   return 0.9;
  if (daysAgo < 7)   return 0.8;
  if (daysAgo < 14)  return 0.65;
  if (daysAgo < 30)  return 0.5;
  if (daysAgo < 60)  return 0.35;
  if (daysAgo < 90)  return 0.2;
  return 0.1;
}

/**
 * Score niche relevance (already 0-1 from data layer).
 */
function scoreNiche(nicheRelevance) {
  return typeof nicheRelevance === 'number' ? Math.min(Math.max(nicheRelevance, 0), 1) : 0.3;
}

/**
 * Score account size: smaller accounts are much more likely to follow back.
 * 0-500 followers = great. 500-5k = good. 50k+ = unlikely.
 */
function scoreSize(followers) {
  if (followers <= 0)    return 0.5;
  if (followers < 200)   return 0.9;
  if (followers < 1000)  return 0.8;
  if (followers < 5000)  return 0.65;
  if (followers < 20000) return 0.45;
  if (followers < 100000) return 0.25;
  if (followers < 500000) return 0.1;
  return 0.03;
}

/**
 * Compute the final F4F score for a profile (0-100, integer).
 */
export function computeF4FScore(profile) {
  const {
    followers = 0,
    following = 0,
    engagementRate,
    lastPostDate,
    nicheRelevance,
  } = profile;

  // If account is private, slight penalty (harder to engage)
  const privacyPenalty = profile.isPrivate ? 0.85 : 1.0;
  // Verified accounts rarely follow back unknowns
  const verifiedPenalty = profile.isVerified ? 0.5 : 1.0;

  const ratioS   = scoreRatio(following, followers)        * WEIGHTS.ratio;
  const engageS  = scoreEngagement(engagementRate)         * WEIGHTS.engagement;
  const activityS = scoreActivity(lastPostDate)            * WEIGHTS.activity;
  const nicheS   = scoreNiche(nicheRelevance)              * WEIGHTS.niche;
  const sizeS    = scoreSize(followers)                    * WEIGHTS.size;

  const raw = (ratioS + engageS + activityS + nicheS + sizeS) * privacyPenalty * verifiedPenalty;
  const score = Math.round(Math.min(Math.max(raw * 100, 1), 99));

  return {
    score,
    breakdown: {
      ratio:      Math.round(scoreRatio(following, followers) * 100),
      engagement: Math.round(scoreEngagement(engagementRate) * 100),
      activity:   Math.round(scoreActivity(lastPostDate) * 100),
      niche:      Math.round(scoreNiche(nicheRelevance) * 100),
      size:       Math.round(scoreSize(followers) * 100),
    },
    followingRatio: followers > 0 ? +(following / followers).toFixed(2) : null,
    label: score >= 75 ? 'High' : score >= 50 ? 'Medium' : score >= 25 ? 'Low' : 'Very Low',
  };
}

/**
 * Enrich profiles with F4F scores.
 */
export function scoreProfiles(profiles) {
  return profiles
    .filter(Boolean)
    .map(p => {
      // Derive engagement rate if not present
      let engagementRate = p.engagementRate;
      if (!engagementRate && p.followers > 0 && p.avgLikesPerPost) {
        engagementRate = ((p.avgLikesPerPost + (p.avgCommentsPerPost || 0)) / p.followers) * 100;
      }
      const enriched = { ...p, engagementRate };
      const result = computeF4FScore(enriched);
      return { ...enriched, ...result };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Get score color class based on value.
 */
export function getScoreColor(score) {
  if (score >= 75) return '#22c55e'; // green
  if (score >= 50) return '#f59e0b'; // amber
  if (score >= 25) return '#f97316'; // orange
  return '#ef4444';                  // red
}

/**
 * Get score label.
 */
export function getScoreLabel(score) {
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
  if (score >= 25) return 'Low';
  return 'Very Low';
}

/**
 * Format following ratio for display.
 */
export function formatRatio(following, followers) {
  if (followers === 0) return 'N/A';
  const r = following / followers;
  return `${r.toFixed(1)}:1`;
}
