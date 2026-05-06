'use client';

import { SORT_OPTIONS } from '@/lib/filters';
import styles from './SortBar.module.css';

export default function SortBar({ sortBy, onSort, view, onViewChange, total }) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={styles.total}>
          <strong>{total}</strong> profiles
        </span>
      </div>
      <div className={styles.right}>
        {/* Sort select */}
        <div className={styles.sortWrap}>
          <span className={styles.sortIcon}>↕</span>
          <select
            className={`select ${styles.select}`}
            value={sortBy}
            onChange={e => onSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'grid' ? styles.viewActive : ''}`}
            onClick={() => onViewChange('grid')}
            title="Grid view"
          >⊞</button>
          <button
            className={`${styles.viewBtn} ${view === 'list' ? styles.viewActive : ''}`}
            onClick={() => onViewChange('list')}
            title="List view"
          >☰</button>
        </div>
      </div>
    </div>
  );
}
