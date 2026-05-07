'use client';

import { useState, useEffect, useRef } from 'react';
import { scoreHex, formatNumber, formatRatio } from '@/lib/utils';
import styles from './page.module.css';

function ScoreBar({ label, value, color, max = 100 }) {
  return (
    <div className={styles.scoreBar}>
      <span className={styles.scoreBarLabel}>{label}</span>
      <div className={styles.scoreBarTrack}>
        <div
          className={styles.scoreBarFill}
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <span className={styles.scoreBarVal}>{value}</span>
    </div>
  );
}

function DistributionChart({ profiles }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || profiles.length === 0) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    // Score buckets: 0-9, 10-19, ..., 90-100
    const buckets = Array(10).fill(0);
    profiles.forEach(p => {
      const i = Math.min(9, Math.floor((p.score || 0) / 10));
      buckets[i]++;
    });
    const maxBucket = Math.max(...buckets, 1);

    ctx.clearRect(0, 0, W, H);

    const padL = 40, padR = 16, padT = 16, padB = 30;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const barW   = chartW / 10 - 4;

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    // Bars
    buckets.forEach((count, i) => {
      const x   = padL + i * (chartW / 10) + 2;
      const barH = (count / maxBucket) * chartH;
      const y   = padT + chartH - barH;
      const color = scoreHex(i * 10 + 5);

      ctx.fillStyle = color + '99';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 3);
      ctx.fill();

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font      = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`${i * 10}`, x + barW / 2, padT + chartH + 14);

      if (count > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font      = '10px Inter';
        ctx.fillText(count, x + barW / 2, y - 4);
      }
    });
  }, [profiles]);

  return (
    <canvas ref={canvasRef} width={400} height={180} className={styles.canvas} />
  );
}

function RatioDistributionChart({ profiles }) {
  const buckets = { '<0.5': 0, '0.5-1': 0, '1-2': 0, '2-3': 0, '3-5': 0, '5+': 0 };
  profiles.forEach(p => {
    const r = p.followers > 0 ? p.following / p.followers : 0;
    if      (r < 0.5) buckets['<0.5']++;
    else if (r < 1)   buckets['0.5-1']++;
    else if (r < 2)   buckets['1-2']++;
    else if (r < 3)   buckets['2-3']++;
    else if (r < 5)   buckets['3-5']++;
    else              buckets['5+']++;
  });

  const colors = ['#ef4444','#f97316','#f59e0b','#22c55e','#10b981','#06b6d4'];
  const entries = Object.entries(buckets);
  const total   = profiles.length || 1;

  return (
    <div className={styles.ratioChart}>
      {entries.map(([label, count], i) => (
        <div key={label} className={styles.ratioRow}>
          <span className={styles.ratioLabel}>{label}</span>
          <div className={styles.ratioBar}>
            <div className={styles.ratioFill}
              style={{ width: `${(count / total) * 100}%`, background: colors[i] }} />
          </div>
          <span className={styles.ratioCount}>{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [loaded,   setLoaded]   = useState(false);

  const loadDemo = async () => {
    setLoading(true);
    try {
      const apiKey = localStorage.getItem('f4f_rapidapi_key') || '';
      const apiHost = localStorage.getItem('f4f_rapidapi_host') || '';

      const res  = await fetch('/api/niche', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-client-api-key': apiKey,
          'x-client-api-host': apiHost
        },
        body: JSON.stringify({ keyword: 'cats', count: 100 }),
      });
      const data = await res.json();
      setProfiles(data.profiles || []);
      setLoaded(true);
    } catch {}
    setLoading(false);
  };

  const stats = profiles.length > 0 ? {
    avg:     Math.round(profiles.reduce((s, p) => s + (p.score || 0), 0) / profiles.length),
    high:    profiles.filter(p => (p.score || 0) >= 75).length,
    medium:  profiles.filter(p => (p.score || 0) >= 50 && (p.score || 0) < 75).length,
    low:     profiles.filter(p => (p.score || 0) < 50).length,
    avgEng:  +(profiles.reduce((s, p) => s + (p.engagementRate || 0), 0) / profiles.length).toFixed(2),
    topRatio: profiles.slice(0, 10).map(p => formatRatio(p.following, p.followers)).join(', '),
    avgFollowers: Math.round(profiles.reduce((s, p) => s + p.followers, 0) / profiles.length),
  } : null;

  const top10 = profiles.slice(0, 10);

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>

        <div className={styles.header}>
          <h1 className={styles.title}>📊 Analytics Dashboard</h1>
          <p className={styles.sub}>Visualize your scouted profiles and understand the data.</p>
        </div>

        {!loaded && (
          <div className={styles.loadCard}>
            <div className={styles.loadIcon}>📊</div>
            <h3>Load Sample Analytics</h3>
            <p>Load a demo dataset to explore the analytics dashboard.</p>
            <button className="btn btn-primary" onClick={loadDemo} disabled={loading}>
              {loading ? '⏳ Loading...' : '🎯 Load Demo Data (Cats Niche)'}
            </button>
          </div>
        )}

        {loaded && stats && (
          <div className={styles.grid}>
            {/* Stat cards */}
            <div className={styles.statCards}>
              {[
                { icon: '🎯', label: 'Avg F4F Score', val: stats.avg, color: scoreHex(stats.avg) },
                { icon: '🟢', label: 'High Score (75+)', val: stats.high, color: '#22c55e' },
                { icon: '🟡', label: 'Medium Score', val: stats.medium, color: '#f59e0b' },
                { icon: '💬', label: 'Avg Engagement', val: `${stats.avgEng}%`, color: '#6366f1' },
                { icon: '👥', label: 'Avg Followers', val: formatNumber(stats.avgFollowers), color: '#ec4899' },
                { icon: '📊', label: 'Total Profiles', val: profiles.length, color: '#a855f7' },
              ].map(s => (
                <div key={s.label} className={styles.statCard}>
                  <span className={styles.statIcon}>{s.icon}</span>
                  <div>
                    <div className={styles.statVal} style={{ color: s.color }}>{s.val}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Score distribution */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>F4F Score Distribution</h3>
              <p className={styles.chartSub}>How scores are distributed across all scouted profiles</p>
              <DistributionChart profiles={profiles} />
            </div>

            {/* Ratio distribution */}
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Following Ratio Distribution</h3>
              <p className={styles.chartSub}>Following:Followers ratio — higher = better F4F target</p>
              <RatioDistributionChart profiles={profiles} />
            </div>

            {/* Top 10 */}
            <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
              <h3 className={styles.chartTitle}>🏆 Top 10 Recommendations</h3>
              <p className={styles.chartSub}>Highest F4F scored profiles from this dataset</p>
              <div className={styles.top10}>
                {top10.map((p, i) => (
                  <div key={p.id} className={styles.top10Row}>
                    <span className={styles.rank}>#{i + 1}</span>
                    <a
                      href={p.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.topUsername}
                    >
                      @{p.username}
                    </a>
                    <ScoreBar
                      label=""
                      value={p.score}
                      color={scoreHex(p.score)}
                    />
                    <span className={styles.topRatio} style={{ color: p.following > p.followers ? '#22c55e' : 'var(--text-muted)' }}>
                      {formatRatio(p.following, p.followers)}
                    </span>
                    <span className={styles.topFollowers}>{formatNumber(p.followers)} followers</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
