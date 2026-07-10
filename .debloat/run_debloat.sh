#!/usr/bin/env bash
set -euo pipefail
PATTERNS_FILE=.debloat/matches_found.txt
if [ ! -f "$PATTERNS_FILE" ]; then
  echo "patterns file missing: $PATTERNS_FILE" >&2
  exit 2
fi
# read patterns
mapfile -t pats < "$PATTERNS_FILE"
# Expand any glob-like patterns (supporting **)
for p in "${pats[@]}"; do
  [ -z "$p" ] && continue
  # If pattern contains glob chars, expand
  if [[ "$p" == *"*"* || "$p" == *"?"* || "$p" == *"["* ]]; then
    for f in $(bash -lc "shopt -s globstar; printf '%s\n' $p" 2>/dev/null); do
      [ -z "$f" ] && continue
      if [ -e "$f" ]; then
        mkdir -p .debloat/._strip_proprietary/$(dirname "$f")
        git mv "$f" .debloat/._strip_proprietary/"$f" 2>/dev/null || mv --preserve=mode "$f" .debloat/._strip_proprietary/"$f"
        echo "moved: $f"
      else
        echo "not found: $f"
      fi
    done
  else
    f="$p"
    if [ -e "$f" ]; then
      mkdir -p .debloat/._strip_proprietary/$(dirname "$f")
      git mv "$f" .debloat/._strip_proprietary/"$f" 2>/dev/null || mv --preserve=mode "$f" .debloat/._strip_proprietary/"$f"
      echo "moved: $f"
    else
      echo "not found: $f"
    fi
  fi
done
echo Done
