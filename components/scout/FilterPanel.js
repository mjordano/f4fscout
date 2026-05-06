'use client';

import { useState } from 'react';
import { DEFAULT_FILTERS, countActiveFilters } from '@/lib/filters';
import styles from './FilterPanel.module.css';

function formatK(n) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(0)}M`;
  if (n >= 1_000)     return `${(n/1_000).toFixed(0)}K`;
  return String(n);
}

export default function FilterPanel({ filters, onChange, profileCount }) {
  const [open, setOpen] = useState(true);
  const activeCount = countActiveFilters(filters);

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <aside className={styles.panel}>
      {/* Header */}
      <div className={styles.head} onClick={() => setOpen(o => !o)}>
        <div className={styles.headLeft}>
          <span className={styles.headIcon}>🎛️</span>
          <span className={styles.headTitle}>Filters</span>
          {activeCount > 0 && (
            <span className="badge badge-purple">{activeCount}</span>
          )}
        </div>
        <div className={styles.headRight}>
          {profileCount !== undefined && (
            <span className={styles.countBadge}>{profileCount} profiles</span>
          )}
          <button className={styles.toggle}>{open ? '▲' : '▼'}</button>
        </div>
      </div>

      {open && (
        <div className={styles.body}>
          {/* Reset */}
          {activeCount > 0 && (
            <button className={`btn btn-ghost btn-sm ${styles.reset}`} onClick={() => onChange(DEFAULT_FILTERS)}>
              ↺ Reset all filters
            </button>
          )}

          {/* Min F4F Score */}
          <div className={styles.group}>
            <label className={styles.label}>
              Min F4F Score
              <span className={styles.val}>{filters.minScore}</span>
            </label>
            <input type="range" className="slider" min={0} max={90} step={5}
              value={filters.minScore}
              onChange={e => set('minScore', Number(e.target.value))}
            />
            <div className={styles.rangeHints}><span>0</span><span>90</span></div>
          </div>

          {/* Followers range */}
          <div className={styles.group}>
            <label className={styles.label}>
              Followers Range
              <span className={styles.val}>{formatK(filters.minFollowers)} – {formatK(filters.maxFollowers)}</span>
            </label>
            <div className={styles.doubleRange}>
              <input type="range" className="slider" min={0} max={500000} step={1000}
                value={filters.minFollowers}
                onChange={e => set('minFollowers', Number(e.target.value))}
              />
              <input type="range" className="slider" min={0} max={10000000} step={10000}
                value={filters.maxFollowers}
                onChange={e => set('maxFollowers', Number(e.target.value))}
              />
            </div>
          </div>

          {/* Min following ratio */}
          <div className={styles.group}>
            <label className={styles.label}>
              Min Following Ratio
              <span className={styles.val}>{filters.minRatio === 0 ? 'Any' : `${filters.minRatio}:1`}</span>
            </label>
            <input type="range" className="slider" min={0} max={5} step={0.5}
              value={filters.minRatio}
              onChange={e => set('minRatio', Number(e.target.value))}
            />
            <div className={styles.rangeHints}><span>Any</span><span>5:1+</span></div>
          </div>

          {/* Min engagement */}
          <div className={styles.group}>
            <label className={styles.label}>
              Min Engagement
              <span className={styles.val}>{filters.minEngagement === 0 ? 'Any' : `${filters.minEngagement}%`}</span>
            </label>
            <input type="range" className="slider" min={0} max={15} step={0.5}
              value={filters.minEngagement}
              onChange={e => set('minEngagement', Number(e.target.value))}
            />
            <div className={styles.rangeHints}><span>Any</span><span>15%</span></div>
          </div>

          {/* Active within */}
          <div className={styles.group}>
            <label className={styles.label}>
              Active Within
              <span className={styles.val}>
                {filters.activeWithinDays >= 365 ? 'Any time' : `${filters.activeWithinDays}d`}
              </span>
            </label>
            <div className={styles.chipRow}>
              {[7, 14, 30, 90, 365].map(d => (
                <button key={d}
                  className={`${styles.chip} ${filters.activeWithinDays === d ? styles.chipActive : ''}`}
                  onClick={() => set('activeWithinDays', d)}
                  type="button"
                >
                  {d >= 365 ? 'Any' : `${d}d`}
                </button>
              ))}
            </div>
          </div>

          {/* Post count */}
          <div className={styles.group}>
            <label className={styles.label}>
              Min Posts
              <span className={styles.val}>{filters.minPosts}</span>
            </label>
            <input type="range" className="slider" min={0} max={500} step={5}
              value={filters.minPosts}
              onChange={e => set('minPosts', Number(e.target.value))}
            />
            <div className={styles.rangeHints}><span>0</span><span>500+</span></div>
          </div>

          {/* Bio keywords */}
          <div className={styles.group}>
            <label className={styles.label}>Bio Keywords</label>
            <input
              className="input"
              type="text"
              placeholder="cat, kitten, meow (comma-separated)"
              value={filters.bioKeywords}
              onChange={e => set('bioKeywords', e.target.value)}
            />
          </div>

          {/* Toggles */}
          <div className={styles.group}>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Include Verified</span>
              <label className="toggle">
                <input type="checkbox" checked={filters.includeVerified}
                  onChange={e => set('includeVerified', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Include Private</span>
              <label className="toggle">
                <input type="checkbox" checked={filters.includePrivate}
                  onChange={e => set('includePrivate', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Include Business</span>
              <label className="toggle">
                <input type="checkbox" checked={filters.includeBusiness}
                  onChange={e => set('includeBusiness', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Has Profile Picture</span>
              <label className="toggle">
                <input type="checkbox" checked={filters.hasProfilePic}
                  onChange={e => set('hasProfilePic', e.target.checked)} />
                <span className="toggle-track" />
              </label>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
