'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Header.module.css';

const NAV = [
  { href: '/',          label: 'Home',      icon: '🏠' },
  { href: '/scout',     label: 'Scout',     icon: '🔍' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/settings',  label: 'Settings',  icon: '⚙️' },
];

export default function Header() {
  const path    = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎯</span>
          <span className={styles.logoText}>
            F4F<span className={styles.logoAccent}>Scout</span>
          </span>
          <span className={styles.logoBeta}>beta</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${path === href ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA + Burger */}
        <div className={styles.actions}>
          <Link href="/scout" className="btn btn-primary btn-sm">
            Start Scouting →
          </Link>
          <button className={styles.burger} onClick={() => setOpen(o => !o)} aria-label="Menu">
            <span className={open ? styles.burgerX : ''}></span>
            <span className={open ? styles.burgerX : ''}></span>
            <span className={open ? styles.burgerX : ''}></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className={styles.mobileMenu}>
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} className={styles.mobileLink} onClick={() => setOpen(false)}>
              {icon} {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
