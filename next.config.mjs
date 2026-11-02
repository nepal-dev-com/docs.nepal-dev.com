import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Static shell plus streamed request-time parts, for the signed-in home page to come (ADR-0016).
  cacheComponents: true,
  // Prefetch each route's reusable shell; set explicitly, as Next.js asks with cacheComponents.
  partialPrefetching: true,
  // Archify diagrams opened directly get the same isolation as their embedding frame (ADR-0011).
  async headers() {
    return [
      {
        source: '/diagrams/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: 'sandbox allow-scripts allow-downloads' },
          { key: 'X-Robots-Tag', value: 'noindex' },
        ],
      },
      // Copies of pages stay readable by tools but out of search results (ADR-0035 decision 6).
      ...['/llms.txt', '/llms-full.txt', '/static.json'].map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      })),
    ];
  },
};

export default withMDX(config);
