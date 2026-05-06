'use client';

import { useState } from 'react';
import Image from 'next/image';
import ScoreRing from '@/components/ui/ScoreRing';
import { formatNumber, formatRatio, timeAgo, copyToClipboard, scoreHex } from '@/lib/utils';
import styles from './ProfileCard.module.css';

export default function ProfileCard({ profile, index = 0, onFavorite, isFavorited = false }) {
  const [copied, setCopied]     = useState(false);
  const [imgError, setImgError] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);

  const {
    username, displayName, bio, profilePicUrl, followers,
    following, postCount, isVerified, isPrivate, isBusiness,
    score = 0, label = '', engagementRate = 0, lastPostDate,
    profileUrl, breakdown, isMock,
  } = profile;

  const ratio     = followers > 0 ? following / followers : 0;
  const ratioStr  = formatRatio(following, followers);
  const ratioGood = ratio >= 1.5;
  const scoreColor = scoreHex(score);

  const handleCopy = async () => {
    const ok = await copyToClipboard(profileUrl || `https://instagram.com/${username}`);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const handleFavorite = () => {
    setFavorited(f => !f);
    onFavorite?.(profile);
  };

  const animDelay = `${Math.min(index * 0.04, 0.6)}s`;

  return (
    <article
      className={styles.card}
      style={{ animationDelay: animDelay }}
      data-score={score}
    >
      {/* Score glow accent */}
      <div className={styles.scoreLine} style={{ background: scoreColor }} />

      {/* Header row */}
      <div className={styles.header}>
        {/* Avatar */}
        <div className={styles.avatarWrap}>
          {!imgError && profilePicUrl ? (
            <img
              src={profilePicUrl}
              alt={username}
              className={styles.avatar}
              onError={() => setImgError(true)}
              width={52}
              height={52}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {(displayName || username || '?').charAt(0).toUpperCase()}
            </div>
          )}
          {isVerified && <span className={styles.verified} title="Verified">✓</span>}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <span className={styles.displayName}>{displayName || username}</span>
            <div className={styles.badges}>
              {isPrivate  && <span className="badge badge-gray">🔒 Private</span>}
              {isBusiness && <span className="badge badge-blue">💼 Business</span>}
              {isMock     && <span className="badge badge-purple">Demo</span>}
            </div>
          </div>
          <a
            href={profileUrl || `https://instagram.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.username}
          >
            @{username}
          </a>
        </div>

        {/* Score ring */}
        <div className={styles.scoreWrap}>
          <ScoreRing score={score} size={58} strokeWidth={5} />
          <span className={styles.scoreLabel} style={{ color: scoreColor }}>{label}</span>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className={styles.bio}>{bio}</p>
      )}

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{formatNumber(followers)}</span>
          <span className={styles.statKey}>Followers</span>
        </div>
        <div className={styles.statDiv} />
        <div className={styles.stat}>
          <span className={styles.statVal}>{formatNumber(following)}</span>
          <span className={styles.statKey}>Following</span>
        </div>
        <div className={styles.statDiv} />
        <div className={`${styles.stat} ${ratioGood ? styles.statHighlight : ''}`}>
          <span className={styles.statVal} style={ratioGood ? { color: '#22c55e' } : {}}>
            {ratioStr}
          </span>
          <span className={styles.statKey}>Ratio</span>
        </div>
        <div className={styles.statDiv} />
        <div className={styles.stat}>
          <span className={styles.statVal}>{formatNumber(postCount)}</span>
          <span className={styles.statKey}>Posts</span>
        </div>
      </div>

      {/* Engagement + Activity row */}
      <div className={styles.meta}>
        {engagementRate > 0 && (
          <span className={styles.metaItem} data-tooltip="Average engagement rate">
            💬 {engagementRate.toFixed(1)}% eng
          </span>
        )}
        {lastPostDate && (
          <span className={styles.metaItem} data-tooltip="Last post date">
            ⚡ {timeAgo(lastPostDate)}
          </span>
        )}
      </div>

      {/* Score breakdown mini bars */}
      {breakdown && (
        <div className={styles.breakdown}>
          {[
            { key: 'ratio',      label: 'Ratio',   val: breakdown.ratio },
            { key: 'activity',   label: 'Active',  val: breakdown.activity },
            { key: 'engagement', label: 'Engage',  val: breakdown.engagement },
            { key: 'niche',      label: 'Niche',   val: breakdown.niche },
          ].map(({ key, label, val }) => (
            <div key={key} className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>{label}</span>
              <div className={styles.breakdownBar}>
                <div
                  className={styles.breakdownFill}
                  style={{ width: `${val}%`, background: scoreColor }}
                />
              </div>
              <span className={styles.breakdownVal}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <a
          href={profileUrl || `https://instagram.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
        >
          Open Profile
        </a>
        <button
          onClick={handleCopy}
          className="btn btn-secondary btn-sm"
          data-tooltip={copied ? 'Copied!' : 'Copy link'}
        >
          {copied ? '✓' : '🔗'}
        </button>
        <button
          onClick={handleFavorite}
          className="btn btn-secondary btn-sm"
          data-tooltip={favorited ? 'Remove from favorites' : 'Add to favorites'}
          style={favorited ? { color: '#f59e0b', borderColor: 'rgba(245,158,11,0.3)' } : {}}
        >
          {favorited ? '★' : '☆'}
        </button>
      </div>
    </article>
  );
}
