'use client';

import { useRef, useEffect } from 'react';
import { scoreHex } from '@/lib/utils';
import styles from './ScoreRing.module.css';

/**
 * Animated SVG circular score indicator.
 */
export default function ScoreRing({ score = 0, size = 64, strokeWidth = 5, animate = true }) {
  const circleRef = useRef(null);
  const r         = (size - strokeWidth * 2) / 2;
  const circ      = 2 * Math.PI * r;
  const offset    = circ - (score / 100) * circ;
  const color     = scoreHex(score);

  useEffect(() => {
    if (!animate || !circleRef.current) return;
    circleRef.current.style.strokeDashoffset = circ;
    const timer = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = offset;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circ, offset, animate]);

  return (
    <div className={styles.ring} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={animate ? circ : offset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: animate ? 'stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)' : 'none',
            filter: `drop-shadow(0 0 4px ${color}80)`,
          }}
        />
      </svg>
      <div className={styles.label} style={{ color }}>
        <span className={styles.score}>{score}</span>
      </div>
    </div>
  );
}
