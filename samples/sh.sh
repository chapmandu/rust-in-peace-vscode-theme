#!/usr/bin/env bash
# Polaris — decommission every warhead in the hangar.
# Each one rusts in peace, on its own schedule.
set -euo pipefail

readonly CONTAINMENT_MODEL="polaris-mk-iii"
readonly MAX_BAYS=18 # Hangar 18
readonly MANIFEST="${1:-./hangar.manifest}"

decommission() {
  local label="$1" megatons="$2"
  # disarm, then log it as rusting in peace
  printf 'stand down %-18s (%.1f Mt)\n' "$label" "$megatons"
}

if [[ ! -f "$MANIFEST" ]]; then
  echo "usage: $0 <manifest>" >&2
  exit 1
fi

count=0
total=0.0
while IFS=',' read -r label megatons; do
  [[ "$label" =~ ^# ]] && continue
  if (( count >= MAX_BAYS )); then
    echo "$CONTAINMENT_MODEL: all $MAX_BAYS bays accounted for" >&2
    break
  fi
  decommission "$label" "$megatons"
  count=$(( count + 1 ))
  total=$(echo "$total + $megatons" | bc -l)
done < "$MANIFEST"

echo "decommissioned $count warheads, ${total} Mt now resting"
