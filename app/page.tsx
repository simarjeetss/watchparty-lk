'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { Suspense, useState } from 'react';
import { generateRoomId } from '@/lib/client-utils';
import styles from '../styles/Home.module.css';

function StartSection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    router.push(`/watchparty/${generateRoomId()}`);
  };

  return (
    <div className={styles.startSection}>
      <div className={styles.startActions}>
        <button
          className={styles.startButton}
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className={styles.buttonSpinner}
                viewBox="0 0 14 14"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="1" width="12" height="12" />
              </svg>
              Creating…
            </>
          ) : (
            <>
              Start a room
              <span className={styles.startButtonArrow}>→</span>
            </>
          )}
        </button>

        <Link href="/about" className={styles.secondaryButton}>
          for nerds 🤓
        </Link>
      </div>
      <span className={styles.startHint}>
        No account required · Share the link to invite
      </span>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <main className={styles.main} data-lk-theme="default">
        <span className={styles.cornerLabel}>Watch Together</span>

        <div className={styles.landingInner}>
          <h1 className={styles.wordmark}>
            Watch<span className={styles.wordmarkAccent}>Party</span>
          </h1>
          <p className={styles.tagline}></p>
          <p className={styles.editorialNote}>
            built this because all other watchparty tools are shit
          </p>

          <Suspense fallback={null}>
            <StartSection />
          </Suspense>

          <hr className={styles.rule} />

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <span className={styles.featureLabel}>Screen share</span>
              <span className={styles.featureValue}>Any source</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureLabel}>Participants</span>
              <span className={styles.featureValue}>Up to 12</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureLabel}>Latency</span>
              <span className={styles.featureValue}>Sub-second</span>
            </div>
          </div>
        </div>
      </main>

      <footer>
        built by someone
      </footer>
    </>
  );
}
