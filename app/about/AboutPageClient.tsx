'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from '../../styles/About.module.css';

const STORAGE_KEY = 'about-page-theme';

const sections = [
  {
    id: 'overview',
    title: 'overview',
    body: [
      'this project is a lightweight watchparty app for people who just want to open a room, send a link, and start watching together. the goal was to remove the usual friction: no account wall, no bloated dashboard, and no confusing setup before the room becomes useful.',
      'it is built as a modern web app, so everything important happens directly in the browser. the site handles room creation, live audio and video, screen sharing, chat, and responsive layouts for phones and laptops.',
    ],
  },
  {
    id: 'stack',
    title: 'the stack',
    bullets: [
      'next.js handles routing, rendering, and server endpoints',
      'typescript keeps the app logic typed and easier to maintain',
      'livekit powers the real-time room layer for audio, video, screen share, and chat',
      'custom css modules shape the visual design instead of relying on a heavy ui framework',
    ],
  },
  {
    id: 'flow',
    title: 'what happens when you start a room',
    body: [
      'when someone presses the main button on the landing page, the app creates a room id and sends them to a dedicated room url. from there, the pre-join screen collects the person\'s name and checks their microphone and camera settings.',
      'after that, the browser calls a server route to request connection details. that server route creates a temporary access token, and the browser uses it to join the room. this is the safe part of the flow because the private credentials stay on the server instead of being exposed in the client.',
    ],
  },
  {
    id: 'realtime',
    title: 'how the live room works',
    body: [
      'livekit takes care of the hard real-time problems. it manages who is connected, whose microphone is active, who is sharing a screen, and how audio and video streams are moved between people in the room.',
      'the watchparty code mainly decides how to present that information. if a screen share is active, the shared screen becomes the main focus and the participant videos move into supporting positions. if nobody is sharing, the room switches to a participant-first layout instead.',
    ],
  },
  {
    id: 'interface',
    title: 'how the interface is organized',
    bullets: [
      'a landing page creates and launches new rooms',
      'a pre-join step lets people set their name and devices before entering',
      'the room ui includes chat, call controls, a timer, and a share-link action',
      'the layout adapts across desktop, tablet, and mobile so the controls stay usable',
      'screen-sharing mode and gallery mode use different compositions for readability',
    ],
  },
  {
    id: 'server',
    title: 'why there is still server code',
    body: [
      'even though this feels like a browser app, there is still a small but important server layer. that layer creates room connection details and signs temporary access tokens. without that step, private keys would have to live in the browser, which would be a bad idea.',
      'in simple terms, the server is the gatekeeper. it does the sensitive work once, sends the browser only what it needs, and keeps the rest hidden.',
    ],
  },
  {
    id: 'custom-work',
    title: 'what was customized',
    body: [
      'this is not just a default starter template with a new logo. the landing page, room visuals, dark palette, responsive behavior, chat interactions, room actions, and mobile layout were all adjusted to make the app feel faster, cleaner, and less annoying to use.',
      'a lot of the work went into removing edge-case friction: chat behavior on phones, screen-share focus, safer room-link sharing, more readable dark colors, and room controls that stay visible on smaller screens.',
    ],
  },
  {
    id: 'plain-english',
    title: 'plain english version',
    body: [
      'this app has three jobs. first, it creates and routes people into rooms. second, it uses livekit to run the actual real-time call. third, it wraps that with a cleaner interface so the experience feels simple instead of technical.',
      'if you ignore the implementation details, the whole system is basically: create room, get safe access, join room, share screen, watch together.',
    ],
  },
] as const;

export function AboutPageClient() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light') {
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <main className={styles.page} data-local-theme={theme}>
      <div className={styles.shell}>
        <article className={styles.article}>
          <Link href="/" className={styles.backLink}>
            back to home
          </Link>

          <header className={styles.header}>
            <div className={styles.headerTopRow}>
              <p className={styles.kicker}>project breakdown</p>
              <button type="button" className={styles.themeButton} onClick={toggleTheme}>
                {theme === 'dark' ? 'switch to light' : 'switch to dark'}
              </button>
            </div>
            <h1 className={styles.title}>inside the project</h1>
            <p className={styles.intro}>
              this page explains what the app is made of, what happens when someone creates a room,
              and why the technical structure is simpler than it might look from the outside.
            </p>

            <div className={styles.summaryStrip}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>frontend</span>
                <span className={styles.summaryValue}>next.js + typescript</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>real-time layer</span>
                <span className={styles.summaryValue}>livekit</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryLabel}>main goal</span>
                <span className={styles.summaryValue}>join fast and watch together</span>
              </div>
            </div>
          </header>

          <div className={styles.sections}>
            {sections.map((section, index) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <div className={styles.sectionMeta}>
                  <span className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                </div>
                <div className={styles.sectionBody}>
                  {'body' in section && section.body?.map((paragraph) => (
                    <p key={paragraph} className={styles.paragraph}>
                      {paragraph}
                    </p>
                  ))}
                  {'bullets' in section && section.bullets ? (
                    <ul className={styles.list}>
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </article>

        <aside className={styles.jumpNav}>
          <div className={styles.jumpNavInner}>
            <p className={styles.jumpLabel}>jump to section</p>
            <nav className={styles.jumpList} aria-label="section navigation">
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`} className={styles.jumpLink}>
                  <span className={styles.jumpNumber}>{String(index + 1).padStart(2, '0')}</span>
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </main>
  );
}