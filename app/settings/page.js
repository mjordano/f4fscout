'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const RAPIDAPI_OPTIONS = [
  {
    name: 'Instagram Scraper API (social-api1-instagram)',
    host: 'instagram-scraper-api2.p.rapidapi.com',
    docs: 'https://rapidapi.com/social-api1-instagram/api/instagram-scraper-api2',
    features: ['Followers List', 'Following List', 'Profile Info', 'Hashtags', 'Search Users'],
    freeTier: 'Free trial tier',
    recommended: false,
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
    name: 'Custom RapidAPI Host...',
    host: 'custom',
    docs: 'https://rapidapi.com',
    features: ['Use any standard RapidAPI host'],
    freeTier: 'Depends on host',
    recommended: false,
  }
];

export default function SettingsPage() {
  const [provider, setProvider] = useState('apify'); // 'apify' | 'rapidapi'

  // Apify state
  const [apifyToken, setApifyToken] = useState('');
  const [apifyActor, setApifyActor] = useState('w0pct4EQqHEnWRnj8');

  // RapidAPI state
  const [apiKey,  setApiKey]  = useState('');
  const [apiHost, setApiHost] = useState(RAPIDAPI_OPTIONS[0].host);
  const [customHost, setCustomHost] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Status
  const [saved,   setSaved]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const savedProvider = localStorage.getItem('f4f_provider') || 'apify';
    const savedApifyToken = localStorage.getItem('f4f_apify_token') || '';
    const savedApifyActor = localStorage.getItem('f4f_apify_actor') || 'w0pct4EQqHEnWRnj8';
    const savedKey = localStorage.getItem('f4f_rapidapi_key') || '';
    const savedHost = localStorage.getItem('f4f_rapidapi_host') || RAPIDAPI_OPTIONS[0].host;

    setProvider(savedProvider);
    setApifyToken(savedApifyToken);
    setApifyActor(savedApifyActor);
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
    localStorage.setItem('f4f_provider', provider);
    localStorage.setItem('f4f_apify_token', apifyToken.trim());
    localStorage.setItem('f4f_apify_actor', apifyActor.trim() || 'w0pct4EQqHEnWRnj8');
    localStorage.setItem('f4f_rapidapi_key', apiKey.trim());
    localStorage.setItem('f4f_rapidapi_host', finalHost);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (provider === 'apify') {
      localStorage.removeItem('f4f_apify_token');
      localStorage.removeItem('f4f_apify_actor');
      setApifyToken('');
      setApifyActor('w0pct4EQqHEnWRnj8');
    } else {
      localStorage.removeItem('f4f_rapidapi_key');
      localStorage.removeItem('f4f_rapidapi_host');
      setApiKey('');
      setCustomHost('');
      setIsCustom(false);
      setApiHost(RAPIDAPI_OPTIONS[0].host);
    }
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
          'x-client-provider': provider,
          'x-client-apify-token': apifyToken.trim(),
          'x-client-apify-actor': apifyActor.trim() || 'w0pct4EQqHEnWRnj8',
          'x-client-api-key': apiKey.trim(), 
          'x-client-api-host': finalHost 
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setTestResult({ ok: false, msg: `✕ Connection failed: ${data.error || 'Check credentials.'}` });
      } else if (data.isDemo) {
        setTestResult({ ok: false, msg: 'Server is still using demo mode.' });
      } else {
        setTestResult({ 
          ok: true, 
          msg: `✓ Connected! Successfully verified profile data for "${data.profile.displayName || data.profile.username}" via ${provider === 'apify' ? 'Apify Actor' : 'RapidAPI'}.` 
        });
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
          <p className={styles.sub}>Configure your scraper provider (Apify Free Tier or RapidAPI) to fetch real Instagram data.</p>
        </div>

        {/* Provider Switcher */}
        <div className={styles.providerTabs}>
          <button 
            className={`${styles.tabBtn} ${provider === 'apify' ? styles.tabBtnActive : ''}`}
            onClick={() => setProvider('apify')}
          >
            🚀 Apify Actor (Recommended — $5 Free Credits/mo)
          </button>
          <button 
            className={`${styles.tabBtn} ${provider === 'rapidapi' ? styles.tabBtnActive : ''}`}
            onClick={() => setProvider('rapidapi')}
          >
            🌐 RapidAPI
          </button>
        </div>

        {/* Demo mode notice */}
        {(!apifyToken && !apiKey) && (
          <div className={styles.noticeBox}>
            <div className={styles.noticeIcon}>🎭</div>
            <div>
              <strong>Demo Mode Active</strong>
              <p>Without an API token or key, F4F Scout generates realistic mock profiles so you can explore all features. Add your credentials below to fetch real Instagram data.</p>
            </div>
          </div>
        )}

        {/* Apify Configuration */}
        {provider === 'apify' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🔑 Apify Actor Configuration</h2>
            <p className={styles.cardDesc}>
              Apify gives <strong>$5 free monthly credits</strong>. Get your API Token from{' '}
              <a href="https://console.apify.com/settings/integrations" target="_blank" rel="noopener noreferrer">
                console.apify.com → Settings → Integrations
              </a>.
            </p>

            <div className={styles.field}>
              <label className={styles.label}>Apify API Token (Personal API Token)</label>
              <input
                className="input"
                type="password"
                placeholder="apify_api_..."
                value={apifyToken}
                onChange={e => setApifyToken(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Apify Actor ID / Name</label>
              <input
                className="input"
                type="text"
                placeholder="w0pct4EQqHEnWRnj8"
                value={apifyActor}
                onChange={e => setApifyActor(e.target.value)}
                autoComplete="off"
              />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Default: <code>w0pct4EQqHEnWRnj8</code> (Instagram Scraper Actor)
              </span>
            </div>

            <div className={styles.actions}>
              <button className="btn btn-primary" onClick={handleSave}>
                {saved ? '✓ Saved!' : '💾 Save Settings'}
              </button>
              <button className="btn btn-secondary" onClick={handleTest} disabled={!apifyToken || testing}>
                {testing ? '⏳ Testing Actor...' : '🔌 Test Connection'}
              </button>
              {apifyToken && (
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
          </div>
        )}

        {/* RapidAPI Configuration */}
        {provider === 'rapidapi' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🔑 RapidAPI Key</h2>
            <p className={styles.cardDesc}>
              Get an API key at <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer">rapidapi.com</a>.
            </p>

            <div className={styles.field}>
              <label className={styles.label}>RapidAPI Key</label>
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
                    {o.name}
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
          </div>
        )}

        {/* Env var instructions */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🚀 Deployment (.env.local)</h2>
          <p className={styles.cardDesc}>
            For production deployment or server-side caching, you can also place your credentials in <code>.env.local</code>:
          </p>
          <div className={styles.codeBlock}>
            <div className={styles.codeLine}><span className={styles.codeComment}># Apify (Recommended)</span></div>
            <div className={styles.codeLine}><span className={styles.codeKey}>APIFY_TOKEN</span>=apify_api_...</div>
            <div className={styles.codeLine}><span className={styles.codeKey}>APIFY_ACTOR_ID</span>=w0pct4EQqHEnWRnj8</div>
            <br />
            <div className={styles.codeLine}><span className={styles.codeComment}># Or RapidAPI</span></div>
            <div className={styles.codeLine}><span className={styles.codeKey}>RAPIDAPI_KEY</span>=your_key_here</div>
            <div className={styles.codeLine}><span className={styles.codeKey}>RAPIDAPI_HOST</span>=instagram-scraper-api2.p.rapidapi.com</div>
          </div>
        </div>

      </div>
    </div>
  );
}
