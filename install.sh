#!/usr/bin/env bash
# slop-media installer — downloads the zero-dep CLI and optionally configures it.
#
#   curl -fsSL https://raw.githubusercontent.com/Jemo69/slop-media/main/install.sh | bash
#   curl -fsSL .../install.sh | bash -s -- --url https://... --token <UPLOAD_TOKEN>
#   ./install.sh --url https://... --token <UPLOAD_TOKEN>
#
# No npm, no node_modules. Just node 18+ and one file in ~/.local/bin.
set -euo pipefail

RAW_CLI="${SLOP_MEDIA_RAW_CLI:-https://raw.githubusercontent.com/Jemo69/slop-media/main/cli/slop-media.js}"
DEFAULT_URL="https://slop-media-jemo69s-projects.vercel.app"

URL="${SLOP_MEDIA_URL:-$DEFAULT_URL}"
TOKEN="${SLOP_MEDIA_TOKEN:-}"
BIN_DIR="${SLOP_MEDIA_BIN:-$HOME/.local/bin}"
NO_SETUP=0

die() { printf 'error: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
usage: install.sh [options]

  --url <url>       app URL (default: the public slop-media deployment)
  --token <token>   UPLOAD_TOKEN; if given, configures the CLI now
  --bin-dir <dir>   where to put the binary (default: ~/.local/bin)
  --no-setup        skip `slop-media setup` even if --token is passed
  -h, --help        this help

env equivalents: SLOP_MEDIA_URL, SLOP_MEDIA_TOKEN, SLOP_MEDIA_BIN, SLOP_MEDIA_RAW_CLI
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --url) [ $# -ge 2 ] || die "--url needs a value"; URL="$2"; shift 2 ;;
    --token) [ $# -ge 2 ] || die "--token needs a value"; TOKEN="$2"; shift 2 ;;
    --bin-dir) [ $# -ge 2 ] || die "--bin-dir needs a value"; BIN_DIR="$2"; shift 2 ;;
    --no-setup) NO_SETUP=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) die "unknown option: $1 (try --help)" ;;
  esac
done

command -v node >/dev/null 2>&1 || die "node 18+ is required (https://nodejs.org)"
node -e 'const v=process.versions.node.split(".").map(Number); if (v[0] < 18) { console.error("node 18+ required, found "+process.versions.node); process.exit(1) }' \
  || die "upgrade node to 18 or newer"

fetch() {
  if command -v curl >/dev/null 2>&1; then curl -fsSL "$1"
  elif command -v wget >/dev/null 2>&1; then wget -qO- "$1"
  else die "need curl or wget to download the CLI"
  fi
}

mkdir -p "$BIN_DIR"
TMP="$BIN_DIR/.slop-media.$$"
trap 'rm -f "$TMP"' EXIT
fetch "$RAW_CLI" > "$TMP"

# sanity check: must be the CLI, not an HTML error page
head -n 1 "$TMP" | grep -q '^#!/usr/bin/env node' || die "download did not return the CLI (check $RAW_CLI)"
chmod 755 "$TMP"
mv "$TMP" "$BIN_DIR/slop-media"
trap - EXIT
printf 'installed: %s\n' "$BIN_DIR/slop-media"

case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *) printf 'note: %s is not on PATH. add this to your shell rc:\n  export PATH="%s:$PATH"\n' "$BIN_DIR" "$BIN_DIR" ;;
esac

if [ "$NO_SETUP" -eq 1 ]; then
  printf '\nnext: slop-media setup --url %s --token <UPLOAD_TOKEN>\n' "$URL"
elif [ -n "$TOKEN" ]; then
  "$BIN_DIR/slop-media" setup --url "$URL" --token "$TOKEN"
  printf '\ntry: slop-media upload demo.mp4 --pr 123 --repo owner/repo\n'
else
  printf '\nnext (copy the token from the owner):\n  %s setup --url %s --token <UPLOAD_TOKEN>\n' "$BIN_DIR/slop-media" "$URL"
fi
