#!/bin/sh
# The sitemap's lastmod comes from git log, and Vercel clones ten commits deep by default (ADR-0042 decision 4).
if [ "$(git rev-parse --is-shallow-repository 2>/dev/null)" != false ]; then
  echo "The build needs the full git history for the sitemap's lastmod: set VERCEL_DEEP_CLONE=true in Vercel's Production environment (ADR-0042)." >&2
  exit 1
fi
