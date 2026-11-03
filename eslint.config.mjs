import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.source/**',
    // Agent skills, vendored and installed: third-party tooling, not this site's code (ADR-0009).
    '.claude/**',
  ]),
]);

export default eslintConfig;
