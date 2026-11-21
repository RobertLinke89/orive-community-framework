#!/bin/bash
# usage: ux-build.sh staging|prod  -> builds the package in $APP/.ux-build (live app untouched)
set -uo pipefail
ENV=$1
if [ "$ENV" = prod ]; then APP=/opt/orive; C=orive-web; else APP=/opt/orive-staging; C=orive-staging; fi
PKG=/tmp/ux-pkg-$ENV.tgz
B=$APP/.ux-build
rm -rf "$B"; mkdir -p "$B"; chmod 700 "$B"
cd "$APP"
for x in src package.json next.config.mjs tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.ts postcss.config.js components.json next-env.d.ts eslint.config.js; do [ -e "$x" ] && cp -a "$x" "$B/"; done
for e in .env .env.local .env.production .env.production.local; do [ -e "$e" ] && cp -a "$e" "$B/"; done
ln -s ../node_modules "$B/node_modules"; ln -s ../public "$B/public"; [ -e scripts ] && ln -s ../scripts "$B/scripts"; [ -e supabase ] && ln -s ../supabase "$B/supabase"
tar xzf "$PKG" -C "$B"
echo "--- typecheck (changed files, prod tsconfig)"
cat > "$B/tsconfig.ux.json" <<'J'
{"extends":"./tsconfig.json","compilerOptions":{"noEmit":true,"incremental":false,"skipLibCheck":true},"include":["next-env.d.ts","src/lib/directory*.ts","src/lib/userProfileExists.ts","src/lib/textFix.ts","src/app/facilitators/page.tsx","src/app/api/directory/**/*.ts","src/app/directory/page.tsx","src/app/not-found.tsx","src/app/[[]username]/page.tsx","src/components/directory/*.tsx","src/components/DirectorySearchResults.tsx","src/components/HeroConciergeChat.tsx","src/components/PublicNavbar.tsx","src/components/Footer.tsx","src/components/MobileMenu.tsx","src/views/CategoryDetail.tsx","src/views/Marketplace.tsx","src/views/OriveChat.tsx","src/app/api/sofia/concierge/route.ts"]}
J
docker exec "$C" sh -c "cd /app/.ux-build && npx tsc -p tsconfig.ux.json 2>&1 | head -40"
rm -f "$B/tsconfig.ux.json"
echo "--- next build"
T0=$(date +%s)
docker exec "$C" sh -c "cd /app/.ux-build && NEXT_TELEMETRY_DISABLED=1 npx next build" > /tmp/ux-build-$ENV.log 2>&1; RC=$?
echo "build_rc=$RC secs=$(( $(date +%s)-T0 ))"
tail -60 /tmp/ux-build-$ENV.log | grep -v "^\s*$" | tail -45
