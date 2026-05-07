'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const RAPIDAPI_OPTIONS = [
  {
    name: 'Instagram Scraper by RocketAPI',
    host: 'rocketapi-for-instagram.p.rapidapi.com',
    docs: 'https://rapidapi.com/rocketapi/api/rocketapi-for-instagram',
    features: ['Followers', 'Following', 'Profile Info', 'Hashtag Search', 'High Reliability'],
    freeTier: '100 req/mo',
    recommended: true,
  },
  {
    name: 'Instagram Bulk Data Extractor',
    host: 'instagram-bulk-profile-scrapper.p.rapidapi.com',
    docs: 'https://rapidapi.com/hazkarami/api/instagram-bulk-profile-scrapper',
    features: ['Bulk profiles', 'Following list', 'Followers list'],
    freeTier: '100 req/mo',
    recommended: false,
  },
  {
    name: 'Instagram Looper API',
    host: 'instagram-looper.p.rapidapi.com',
    docs: 'https://rapidapi.com/Data-Looper/api/instagram-looper',
    features: ['Profile Info', 'Followers', 'Following', 'Fast Response'],
    freeTier: '50 req/mo',
    recommended: false,
  },
  {
    name: 'Instagram Looter2',
    host: 'instagram-looter2.p.rapidapi.com',
    docs: 'https://rapidapi.com/irrors-apis/api/instagram-looter2',
    features: ['Profile Info', 'Followers', 'Following', 'Hashtags'],
    freeTier: 'Check Docs',
    recommended: false,
  },
];

export default function SettingsPage() {
  const [apiKey,  setApiKey]  = useState('');
  const [apiHost, setApiHost] = useState(RAPIDAPI_OPTIONS[0].host);
  const [saved,   setSaved]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setApiKey(localStorage.getItem('f4f_rapidapi_key')  || '');
    setApiHost(localStorage.getItem('f4f_rapidapi_host') || RAPIDAPI_OPTIONS[0].host);
  }, []);

  const handleSave = () => {
    localStorage.setItem('f4f_rapidapi_key',  apiKey.trim());
    localStorage.setItem('f4f_rapidapi_host', apiHost);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('f4f_rapidapi_key');
    localStorage.removeItem('f4f_rapidapi_host');
    setApiKey('');
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/scout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-client-api-key': apiKey, 'x-client-api-host': apiHost },
        body: JSON.stringify({ mode: 'account', username: 'instagram', count: 5 }),
      });
      const data = await res.json();
      if (data.isDemo) {
        setTestResult({ ok: false, msg: 'Server is still using demo mode. Add RAPIDAPI_KEY to .env.local and restart.' });
      } else {
        setTestResult({ ok: true, msg: `✓ Connected! Got ${data.total} profiles from real API.` });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: e.message });
    }
    setTesting(false);
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>

        <div className={styles.header}>
          <h1 className={styles.title}>⚙️ Settings</h1>
          <p className={styles.sub}>Configure your RapidAPI key to fetch real Instagram data.</p>
        </div>

        {/* Demo mode notice */}
        <div className={styles.noticeBox}>
          <div className={styles.noticeIcon}>🎭</div>
          <div>
            <strong>Demo Mode Active</strong>
            <p>Without an API key, F4F Scout generates realistic mock profiles so you can explore all features. Add a RapidAPI key below to unlock real Instagram data.</p>
          </div>
        </div>

        {/* API Key section */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🔑 RapidAPI Key</h2>
          <p className={styles.cardDesc}>
            Get a free API key at <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer">rapidapi.com</a>.
            The key should be added to your <code>.env.local</code> file on the server for security.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>API Key</label>
            <input
              className="input"
              type="password"
              placeholder="your_rapidapi_key_here"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>API Host (provider)</label>
            <select className="select" value={apiHost} onChange={e => setApiHost(e.target.value)}>
              {RAPIDAPI_OPTIONS.map(o => (
                <option key={o.host} value={o.host}>{o.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={handleSave}>
              {saved ? '✓ Saved!' : '💾 Save Key'}
            </button>
            <button className="btn btn-secondary" onClick={handleTest} disabled={!apiKey || testing}>
              {testing ? '⏳ Testing...' : '🔌 Test Connection'}
            </button>
            {apiKey && (
              <button className="btn btn-ghost" onClick={handleClear}>
                🗑 Clear
              </button>
            )}
          </div>

          {testResult && (
            <div className={testResult.ok ? styles.successBox : styles.errorBox}>
              {testResult.msg}
            </div>
          )}

          {/* Important note */}
          <div className={styles.warningBox}>
            <strong>⚠️ Important:</strong> For production deployment on Vercel, set{' '}
            <code>RAPIDAPI_KEY</code> and <code>RAPIDAPI_HOST</code> as Environment Variables in your
            Vercel project settings — not in the browser. The browser key above is for local testing only.
          </div>
        </div>

        {/* Provider comparison */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📋 Recommended API Providers</h2>
          <div className={styles.providerGrid}>
            {RAPIDAPI_OPTIONS.map(o => (
              <div key={o.host} className={`${styles.providerCard} ${o.recommended ? styles.providerRecommended : ''}`}>
                {o.recommended && <span className={styles.recBadge}>⭐ Recommended</span>}
                <h3 className={styles.providerName}>{o.name}</h3>
                <div className={styles.providerFeatures}>
                  {o.features.map(f => <span key={f} className={styles.feature}>✓ {f}</span>)}
                </div>
                <div className={styles.providerMeta}>
                  <span className={styles.freeTier}>Free: {o.freeTier}</span>
                  <a href={o.docs} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    View Docs →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Env var instructions */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🚀 Vercel Deployment Setup</h2>
          <div className={styles.codeBlock}>
            <div className={styles.codeLine}><span className={styles.codeComment}># .env.local (local dev)</span></div>
            <div className={styles.codeLine}><span className={styles.codeKey}>RAPIDAPI_KEY</span>=your_key_here</div>
            <div className={styles.codeLine}><span className={styles.codeKey}>RAPIDAPI_HOST</span>=instagram-scraper-api2.p.rapidapi.com</div>
          </div>
          <p className={styles.cardDesc} style={{marginTop: 16}}>
            On Vercel: Project Settings → Environment Variables → add <code>RAPIDAPI_KEY</code> and <code>RAPIDAPI_HOST</code>.
          </p>
        </div>

      </div>
    </div>
  );
}
