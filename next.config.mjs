import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Static shell plus streamed request-time parts, for the signed-in home page to come (ADR-0016).
  cacheComponents: true,
  // Prefetch each route's reusable shell; set explicitly, as Next.js asks with cacheComponents.
  partialPrefetching: true,
};

export default withMDX(config);
