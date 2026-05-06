'use client';

import { useState } from 'react';
import styles from './SearchPanel.module.css';

const MODES = [
  { id: 'account',  label: 'By Account',    icon: '👤', desc: 'Discover followers of a specific account' },
  { id: 'multi',    label: 'Multi-Account', icon: '👥', desc: 'Analyze audience overlap across accounts' },
  { id: 'niche',    label: 'By Niche',      icon: '🎨', desc: 'Find profiles in a topic or niche' },
  { id: 'hashtag',  label: 'By Hashtag',    icon: '#',  desc: 'Discover users posting with a hashtag' },
];

const POPULAR_NICHES = ['cats','photography','fitness','food','travel','fashion','art','nature','dogs','gaming'];
const POPULAR_TAGS   = ['catsofinstagram','catlovers','meow','kitten','mainecoon','persiancat','catmom','catlover'];

export default function SearchPanel({ onSearch, loading }) {
  const [mode, setMode]         = useState('account');
  const [username, setUsername] = useState('');
  const [usernames, setUsernames] = useState([]);
  const [usernameInput, setUsernameInput] = useState('');
  const [niche, setNiche]       = useState('');
  const [hashtag, setHashtag]   = useState('');
  const [count, setCount]       = useState(80);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const payload = { mode, count };

    if (mode === 'account') {
      if (!username.trim()) return;
      payload.username = username.trim().replace('@', '');
    } else if (mode === 'multi') {
      if (usernames.length === 0) return;
      payload.usernames = usernames;
    } else if (mode === 'niche') {
      if (!niche.trim()) return;
      payload.keyword = niche.trim();
    } else if (mode === 'hashtag') {
      if (!hashtag.trim()) return;
      payload.hashtag = hashtag.trim().replace('#', '');
    }

    onSearch(payload);
  };

  const addUsername = () => {
    const val = usernameInput.trim().replace('@', '');
    if (val && !usernames.includes(val) && usernames.length < 5) {
      setUsernames(u => [...u, val]);
      setUsernameInput('');
    }
  };

  const removeUsername = (u) => setUsernames(prev => prev.filter(x => x !== u));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addUsername(); }
  };

  const canSubmit = !loading && (
    (mode === 'account'  && username.trim()) ||
    (mode === 'multi'    && usernames.length > 0) ||
    (mode === 'niche'    && niche.trim()) ||
    (mode === 'hashtag'  && hashtag.trim())
  );

  return (
    <div className={styles.panel}>
      {/* Mode tabs */}
      <div className={styles.modes}>
        {MODES.map(m => (
          <button
            key={m.id}
            className={`${styles.modeBtn} ${mode === m.id ? styles.modeActive : ''}`}
            onClick={() => setMode(m.id)}
            type="button"
          >
            <span className={styles.modeIcon}>{m.icon}</span>
            <span className={styles.modeLabel}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Mode description */}
      <p className={styles.modeDesc}>
        {MODES.find(m => m.id === mode)?.desc}
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Account mode */}
        {mode === 'account' && (
          <div className={styles.inputWrap}>
            <span className={styles.inputPrefix}>@</span>
            <input
              className={`input ${styles.input}`}
              type="text"
              placeholder="instagram_username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Multi-account mode */}
        {mode === 'multi' && (
          <div className={styles.multiWrap}>
            <div className={styles.tagsRow}>
              {usernames.map(u => (
                <span key={u} className={styles.tag}>
                  @{u}
                  <button type="button" className={styles.tagRemove} onClick={() => removeUsername(u)}>×</button>
                </span>
              ))}
            </div>
            {usernames.length < 5 && (
              <div className={styles.inputWrap}>
                <span className={styles.inputPrefix}>@</span>
                <input
                  className={`input ${styles.input}`}
                  type="text"
                  placeholder="Add username (max 5)"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button type="button" className={styles.addBtn} onClick={addUsername}>Add</button>
              </div>
            )}
          </div>
        )}

        {/* Niche mode */}
        {mode === 'niche' && (
          <div className={styles.nicheWrap}>
            <input
              className="input"
              type="text"
              placeholder="e.g. cats, fitness, photography..."
              value={niche}
              onChange={e => setNiche(e.target.value)}
            />
            <div className={styles.suggestions}>
              <span className={styles.suggestLabel}>Popular:</span>
              {POPULAR_NICHES.map(n => (
                <button
                  key={n} type="button"
                  className={`${styles.suggestChip} ${niche === n ? styles.suggestActive : ''}`}
                  onClick={() => setNiche(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hashtag mode */}
        {mode === 'hashtag' && (
          <div className={styles.hashtagWrap}>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>#</span>
              <input
                className={`input ${styles.input}`}
                type="text"
                placeholder="catsofinstagram"
                value={hashtag}
                onChange={e => setHashtag(e.target.value.replace('#', ''))}
              />
            </div>
            <div className={styles.suggestions}>
              <span className={styles.suggestLabel}>Popular:</span>
              {POPULAR_TAGS.map(t => (
                <button
                  key={t} type="button"
                  className={`${styles.suggestChip} ${hashtag === t ? styles.suggestActive : ''}`}
                  onClick={() => setHashtag(t)}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Count selector */}
        <div className={styles.countRow}>
          <label className={styles.countLabel}>
            Results to fetch:
            <span className={styles.countVal}>{count}</span>
          </label>
          <input
            type="range"
            className="slider"
            min={20} max={200} step={20}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
          />
          <div className={styles.countHints}>
            <span>20</span><span>200</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`btn btn-primary btn-lg ${styles.submitBtn}`}
          disabled={!canSubmit}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Scouting...
            </>
          ) : (
            <>🎯 Start Scouting</>
          )}
        </button>
      </form>
    </div>
  );
}
