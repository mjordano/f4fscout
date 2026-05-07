'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchPanel  from '@/components/scout/SearchPanel';
import FilterPanel  from '@/components/scout/FilterPanel';
import SortBar      from '@/components/scout/SortBar';
import ProfileCard  from '@/components/scout/ProfileCard';
import { DEFAULT_FILTERS, applyFilters, applySort } from '@/lib/filters';
import { toCSV, downloadFile, pluralize } from '@/lib/utils';
import styles from './page.module.css';

function ScoutPageInner() {
  const params = useSearchParams();

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [filters,   setFilters]   = useState(DEFAULT_FILTERS);
  const [sortBy,    setSortBy]    = useState('score_desc');
  const [view,      setView]      = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [isDemo,    setIsDemo]    = useState(false);
  const [searchCtx, setSearchCtx] = useState(null);
  const [page,      setPage]      = useState(1);
  const PAGE_SIZE = 24;

  // Apply filters + sort
  const displayed = applySort(applyFilters(allProfiles, filters), sortBy);
  const paginated  = displayed.slice(0, page * PAGE_SIZE);
  const hasMore    = paginated.length < displayed.length;

  // Pre-fill from URL params
  useEffect(() => {
    const mode = params.get('mode');
    const q    = params.get('q');
    if (mode && q) {
      handleSearch({ mode, keyword: q, hashtag: q, username: q, count: 80 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setAllProfiles([]);
    setPage(1);
    setSearchCtx(payload);

    const endpoint = payload.mode === 'niche'   ? '/api/niche'
                   : payload.mode === 'hashtag' ? '/api/hashtag'
                   : '/api/scout';

    try {
      const apiKey = localStorage.getItem('f4f_rapidapi_key') || '';
      const apiHost = localStorage.getItem('f4f_rapidapi_host') || '';

      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-client-api-key': apiKey,
          'x-client-api-host': apiHost
        },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setAllProfiles(data.profiles || []);
      setIsDemo(data.isDemo || false);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFavorite = (profile) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(profile.username)) next.delete(profile.username);
      else next.add(profile.username);
      return next;
    });
  };

  const handleExportCSV = () => {
    const csv = toCSV(displayed);
    downloadFile(csv, 'f4fscout-profiles.csv', 'text/csv');
  };

  const handleExportJSON = () => {
    downloadFile(JSON.stringify(displayed, null, 2), 'f4fscout-profiles.json', 'application/json');
  };

  const handleCopyAll = async () => {
    const links = displayed.map(p => p.profileUrl || `https://instagram.com/${p.username}`).join('\n');
    await navigator.clipboard.writeText(links);
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>

        {/* Left column: Search + Filters */}
        <aside className={styles.sidebar}>
          <SearchPanel onSearch={handleSearch} loading={loading} />

          {allProfiles.length > 0 && (
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              profileCount={displayed.length}
            />
          )}

          {/* Settings link */}
          <a href="/settings" className={styles.settingsLink}>
            ⚙️ Configure API Key
          </a>
        </aside>

        {/* Right column: Results */}
        <div className={styles.results}>

          {/* Demo banner */}
          {isDemo && (
            <div className={styles.demoBanner}>
              <span>🎭</span>
              <span>
                <strong>Demo Mode</strong> — showing realistic mock data.{' '}
                <a href="/settings">Add your RapidAPI key</a> to fetch real Instagram profiles.
              </span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className={styles.errorBox}>
              <span>⚠️</span>
              <span><strong>Error:</strong> {error}</span>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.loadingOrb} />
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
              <p>Scouting profiles...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && allProfiles.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎯</div>
              <h2>Ready to Scout</h2>
              <p>Enter a username, niche, or hashtag on the left to discover follow-back candidates.</p>
              <p className={styles.emptyHint}>
                💡 Tip: Start with a niche account in your category, like <strong>@cats_of_instagram</strong>
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && allProfiles.length > 0 && (
            <>
              {/* Sort bar + export toolbar */}
              <div className={styles.toolbar}>
                <SortBar
                  sortBy={sortBy}
                  onSort={val => { setSortBy(val); setPage(1); }}
                  view={view}
                  onViewChange={setView}
                  total={displayed.length}
                />
                <div className={styles.exportRow}>
                  <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}
                    data-tooltip="Download as CSV">
                    📥 CSV
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleExportJSON}
                    data-tooltip="Download as JSON">
                    📥 JSON
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={handleCopyAll}
                    data-tooltip="Copy all profile links">
                    🔗 Copy All
                  </button>
                </div>
              </div>

              {/* Empty filter result */}
              {displayed.length === 0 && (
                <div className={styles.emptyFilter}>
                  <span>🔍</span>
                  <p>No profiles match your current filters. Try relaxing some constraints.</p>
                </div>
              )}

              {/* Profile grid or list */}
              <div className={view === 'grid' ? styles.grid : styles.list}>
                {paginated.map((p, i) => (
                  <ProfileCard
                    key={p.id || p.username}
                    profile={p}
                    index={i}
                    onFavorite={handleFavorite}
                    isFavorited={favorites.has(p.username)}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className={styles.loadMore}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(p => p + 1)}
                  >
                    Load More ({displayed.length - paginated.length} remaining)
                  </button>
                </div>
              )}

              {/* Summary */}
              <p className={styles.summary}>
                Showing {paginated.length} of {pluralize(displayed.length, 'profile')}
                {allProfiles.length !== displayed.length && ` (${allProfiles.length} total before filters)`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ScoutPage() {
  return (
    <Suspense>
      <ScoutPageInner />
    </Suspense>
  );
}
