import Link from 'next/link';
import styles from './page.module.css';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Smart F4F Score',
    desc: 'Proprietary algorithm scoring profiles 0–100 on likelihood to follow back, based on ratio, engagement, activity, and niche.',
  },
  {
    icon: '📊',
    title: 'Following Ratio Analysis',
    desc: 'Instantly spots profiles that follow 2x–10x more accounts than follow them — your #1 signal for follow-backs.',
  },
  {
    icon: '🔍',
    title: '4 Discovery Modes',
    desc: 'Scout by account, multiple accounts (overlap), niche/topic, or hashtag. Find your ideal audience wherever they hide.',
  },
  {
    icon: '🎛️',
    title: 'Powerful Filters',
    desc: '12+ filters including follower range, bio keywords, engagement rate, activity window, account type, and more.',
  },
  {
    icon: '📈',
    title: 'Engagement Intelligence',
    desc: 'Identifies profiles that actively like and comment — the ones who are actually on the platform daily.',
  },
  {
    icon: '📤',
    title: 'Export & Track',
    desc: 'Export your curated list to CSV or JSON. Star favorites, copy links in bulk, track your follow-back campaigns.',
  },
];

const STATS = [
  { val: '12+',   label: 'Filter Options' },
  { val: '10',    label: 'Sort Modes' },
  { val: '4',     label: 'Discovery Modes' },
  { val: '100',   label: 'F4F Score (max)' },
];

const NICHES = ['🐱 Cats', '📸 Photography', '💪 Fitness', '🍕 Food', '✈️ Travel', '🎨 Art', '🎵 Music', '🐶 Dogs', '👗 Fashion', '🌿 Nature'];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroBadge}>
            <span>🎯</span> AI-powered follow-back intelligence
          </div>

          <h1 className={styles.heroTitle}>
            Find Instagram Profiles<br />
            <span className="grad-text">Most Likely to Follow Back</span>
          </h1>

          <p className={styles.heroSub}>
            F4F Scout analyzes follower ratios, engagement patterns, niche relevance,
            and activity to surface the profiles most likely to return your follow.
          </p>

          <div className={styles.heroActions}>
            <Link href="/scout" className="btn btn-primary btn-lg">
              🚀 Start Scouting Free
            </Link>
            <Link href="/scout" className="btn btn-secondary btn-lg">
              View Demo
            </Link>
          </div>

          {/* Stats row */}
          <div className={styles.statsRow}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statBox}>
                <span className={styles.statVal}>{s.val}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative orbs */}
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </section>

      {/* Features */}
      <section className={`section ${styles.features}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Everything You Need to Grow Faster</h2>
            <p className={styles.sectionSub}>Purpose-built for smart Instagram growth — not spam, but strategy.</p>
          </div>

          <div className={styles.featureGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`section ${styles.howItWorks}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSub}>Three steps to a curated, high-quality follow list.</p>
          </div>

          <div className={styles.steps}>
            {[
              { n: '01', icon: '🔍', title: 'Choose a Target', desc: 'Enter a niche account, hashtag, or topic to scout.' },
              { n: '02', icon: '⚙️', title: 'Apply Filters & Sort', desc: 'Narrow down by ratio, engagement, activity, and bio keywords.' },
              { n: '03', icon: '🚀', title: 'Follow & Track', desc: 'Open profiles directly, copy links, or export your curated list.' },
            ].map((s, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{s.n}</div>
                <div className={styles.stepIcon}>{s.icon}</div>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
                {i < 2 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Niches */}
      <section className={`section-sm ${styles.nicheSection}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Works for Any Niche</h2>
            <p className={styles.sectionSub}>From cat lovers to fitness gurus — find your people.</p>
          </div>
          <div className={styles.nicheRow}>
            {NICHES.map(n => (
              <Link key={n} href={`/scout?mode=niche&q=${n.split(' ')[1].toLowerCase()}`} className={styles.nicheChip}>
                {n}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`section ${styles.cta}`}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Ready to Find Your Follow-Backs?</h2>
            <p className={styles.ctaSub}>Works in demo mode — no account or API key needed to try it out.</p>
            <Link href="/scout" className="btn btn-primary btn-lg">
              🎯 Launch F4F Scout →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
