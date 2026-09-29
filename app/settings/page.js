'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const RAPIDAPI_OPTIONS = [
  {
    name: 'Instagram Scraper API (social-api1-instagram)',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    docs: 'https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2',
    features: ['Followers List', 'Following List', 'Profile Info', 'Hashtags', 'Search Users'],
    freeTier: 'Basic tier available',
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
  {
    name: 'Instagram Scraper by RocketAPI (Deprecated)',
    host: 'rocketapi-for-instagram.p.rapidapi.com',
    docs: 'https://rapidapi.com/rocketapi/api/rocketapi-for-instagram',
    features: ['Followers', 'Following', 'Profile Info', 'Hashtag Search', 'High Reliability'],
    freeTier: 'Inactive on RapidAPI',
    recommended: false,
    deprecated: true,
  },
  {
    name: 'Custom Host...',
    host: 'custom',
    docs: 'https://rapidapi.com',
    features: ['Use any standard RapidAPI host'],
    freeTier: 'Depends on host',
    recommended: false,
  }
];

export default function SettingsPage() {
  const [apiKey,  setApiKey]  = useState('');
  const [apiHost, setApiHost] = useState(RAPIDAPI_OPTIONS[0].host);
  const [customHost, setCustomHost] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('f4f_rapidapi_key') || '';
    const savedHost = localStorage.getItem('f4f_rapidapi_host') || RAPIDAPI_OPTIONS[0].host;
    setApiKey(savedKey);

    const match = RAPIDAPI_OPTIONS.find(o => o.host === savedHost);
    if (match && savedHost !== 'custom') {
      setApiHost(savedHost);
      setIsCustom(false);
    } else if (savedHost) {
      setApiHost('custom');
      setCustomHost(savedHost);
      setIsCustom(true);
    }
  }, []);

  const handleHostChange = (e) => {
    const val = e.target.value;
    setApiHost(val);
    if (val === 'custom') {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setCustomHost('');
    }
  };

  const handleSave = () => {
    const finalHost = isCustom ? customHost.trim() : apiHost;
    localStorage.setItem('f4f_rapidapi_key',  apiKey.trim());
    localStorage.setItem('f4f_rapidapi_host', finalHost);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    localStorage.removeItem('f4f_rapidapi_key');
    localStorage.removeItem('f4f_rapidapi_host');
    setApiKey('');
    setCustomHost('');
    setIsCustom(false);
    setApiHost(RAPIDAPI_OPTIONS[0].host);
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const finalHost = isCustom ? customHost.trim() : apiHost;
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-client-api-key': apiKey.trim(), 
          'x-client-api-host': finalHost 
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setTestResult({ ok: false, msg: `✕ Connection failed: ${data.error || 'Check details.'}` });
      } else if (data.isDemo) {
        setTestResult({ ok: false, msg: 'Server is still using demo mode. Add RAPIDAPI_KEY to .env.local and restart.' });
      } else {
        setTestResult({ ok: true, msg: `✓ Connected! Successfully verified profile data for "${data.profile.displayName}" via real API.` });
      }
    } catch (e) {
      setTestResult({ ok: false, msg: `✕ Error: ${e.message}` });
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
            <select className="select" value={apiHost} onChange={handleHostChange}>
              {RAPIDAPI_OPTIONS.map(o => (
                <option key={o.host} value={o.host}>
                  {o.name} {o.deprecated ? ' (deprecated)' : ''}
                </option>
              ))}
            </select>
          </div>

          {isCustom && (
            <div className={styles.field}>
              <label className={styles.label}>Custom API Host</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. instagram-scraper-api2.p.rapidapi.com"
                value={customHost}
                onChange={e => setCustomHost(e.target.value)}
                autoComplete="off"
              />
            </div>
          )}

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
            {RAPIDAPI_OPTIONS.filter(o => o.host !== 'custom' && !o.deprecated).map(o => (
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
