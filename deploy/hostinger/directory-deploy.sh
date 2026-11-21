#!/bin/sh
# usage: deploy.sh <appdir> <container> <ts>
set -u
D=$1; C=$2; TS=$3
cd "$D" || exit 1
FILES="src/lib/directoryBuild.ts src/lib/directorySample.ts src/app/[username]/page.tsx src/components/directory/DirectoryProfilePage.tsx src/app/api/directory/remove/route.ts src/app/api/directory/inquiry/route.ts src/app/directory/remove/[slug]/page.tsx src/app/directory/claim/[slug]/page.tsx"
B=/root/directory-a-rollout-$TS-$C; mkdir -p $B
for f in $FILES; do [ -e "$f" ] && tar rf $B/src-before.tar "$f"; done
echo "$FILES" > $B/files.txt
rm -rf "$B/next-before" && cp -a .next "$B/next-before"
cat > $B/ROLLBACK.sh <<RB
#!/bin/sh
set -e
cd "$D"
rm -f src/lib/directoryBuild.ts src/app/api/directory/inquiry/route.ts
tar xf $B/src-before.tar
rm -rf .next && cp -a $B/next-before .next
docker restart $C
echo rolled back $C
RB
chmod 700 $B/ROLLBACK.sh
tar xzf /root/directory-new.tgz
docker exec $C sh -c "cd /app && NEXT_TELEMETRY_DISABLED=1 npx next build" > $B/build.log 2>&1
R=$?
if [ $R -ne 0 ]; then echo BUILD_FAILED; grep -iE "error|failed" $B/build.log | head -20; sh $B/ROLLBACK.sh; exit 1; fi
docker restart $C >/dev/null && echo "OK $C backup=$B"
