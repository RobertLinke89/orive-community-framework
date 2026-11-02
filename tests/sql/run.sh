#!/usr/bin/env bash
# Local Postgres 17 smoke test of both migrations against Supabase stubs. Usage: PGPORT=54329 PGHOST=/tmp tests/sql/run.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
P="psql -U postgres -v ON_ERROR_STOP=1 -q"
$P -c "drop database if exists orive_audit" -c "create database orive_audit" >/dev/null
$P -d orive_audit -f tests/sql/stubs.sql >/dev/null
$P -d orive_audit -f supabase/migrations/20261027000000_session_booking_calendar.sql >/dev/null 2>&1
$P -d orive_audit -f supabase/migrations/20261027120000_payment_security.sql >/dev/null 2>&1
$P -d orive_audit -f tests/sql/smoke.sql
# media migration smoke (own DB, all claim migrations + storage stub)
$P -c "drop database if exists orive_media" -c "create database orive_media" >/dev/null
$P -d orive_media -f tests/sql/stubs.sql >/dev/null; $P -d orive_media -f tests/sql/storage_stubs.sql >/dev/null
for m in supabase/migrations/2026102[7-9]*.sql supabase/migrations/2026103*.sql supabase/migrations/202611*.sql; do $P -d orive_media -f "$m" >/dev/null 2>&1; done
$P -d orive_media -f tests/sql/media_smoke.sql
$P -d orive_media -f tests/sql/media_variants_smoke.sql
$P -d orive_media -f tests/sql/media_cover_smoke.sql
