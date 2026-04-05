/**
 * app/loading.tsx
 *
 * Next.js App Router loading UI — shown automatically during:
 *  • Initial page load (server-side suspense boundary)
 *  • Client-side navigation while the next page is streaming
 *
 * Design: matches the minimal, square-geometry language of the app.
 * Uses the .wp-page-loader classes defined in globals.css.
 */
export default function Loading() {
  return (
    <div className="wp-page-loader">
      <div className="wp-page-loader__icon">
        {/*
          A 32×32 square that draws itself via stroke-dashoffset animation.
          rect perimeter = (32-4)*4 = 112 → dasharray 112
        */}
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="28" height="28" />
        </svg>
      </div>
      <span className="wp-page-loader__label">Loading</span>
    </div>
  );
}
