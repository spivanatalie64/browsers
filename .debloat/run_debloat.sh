#!/usr/bin/env bash
set -euo pipefail
PATTERNS_FILE=.debloat/proprietary_patterns.txt
if [ ! -f "$PATTERNS_FILE" ]; then
  echo "patterns file missing: $PATTERNS_FILE" >&2
  exit 2
fi
# read patterns
mapfile -t pats < "$PATTERNS_FILE"
# find matches
while IFS= read -r p; do
  # skip empty
  if [ -z "$p" ]; then continue; fi
  # move if exists
  if [ -e "$p" ]; then
    mkdir -p .debloat/._strip_proprietary/$(dirname "$p")
    git mv "$p" .debloat/._strip_proprietary/"$p" || mv "$p" .debloat/._strip_proprietary/"$p"
    echo "moved: $p"
  else
    echo "not found: $p"
  fi
done < <(printf "%s
" "${pats[@]}")
echo Done
