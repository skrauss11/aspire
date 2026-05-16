#!/usr/bin/env bash
set -euo pipefail

targets=(
  "index.html"
  "manifesto.html"
  "og-card.html"
  "score/index.html"
  "account/index.html"
  "simulator/index.html"
  "netlify/functions"
  "content"
)

patterns=(
  "beat inflation"
  "guaranteed"
  "personalized investment advice"
  "optimize your portfolio"
  "the best asset"
  "risk-free"
  "achieve your dreams"
  "supercharge"
  "unlock"
  "in today's economy"
  "delve"
  "unpack"
  "leverage"
)

existing=()
for target in "${targets[@]}"; do
  if [[ -e "$target" ]]; then
    existing+=("$target")
  fi
done

if [[ ${#existing[@]} -eq 0 ]]; then
  echo "No user-facing surfaces found to scan."
  exit 0
fi

failed=0
for pattern in "${patterns[@]}"; do
  if grep -RInE --include='*.html' --include='*.js' --include='*.mdx' "\\b${pattern}\\b" "${existing[@]}"; then
    echo "Compliance check failed: banned phrase '${pattern}' found." >&2
    failed=1
  fi
done

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi

echo "Compliance check passed."
