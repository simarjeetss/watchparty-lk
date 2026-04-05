'use client';

import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

const STORAGE_KEY = 'wp-theme';

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Read persisted preference after mount (avoids SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const light = saved === 'light';
    setIsLight(light);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    localStorage.setItem(STORAGE_KEY, next ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', next ? 'light' : 'dark');
  };

  // Don't render until we know the real state — prevents flash of wrong icon
  if (!mounted) return null;

  return (
    <button
      className={styles.themeToggle}
      onClick={toggle}
      data-active={isLight ? 'true' : 'false'}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span className={styles.themeToggleTrack}>
        <span className={styles.themeToggleThumb} />
      </span>
      <span className={styles.themeToggleLabel}>
        {isLight ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
