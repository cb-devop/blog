#!/usr/bin/env bash
#
# PremiumBlog — one-shot deploy script
# Usage: bash deploy/deploy.sh   (run from the project root on the VPS)
#
# Prerequisites (see deploy/README.md):
#   - Node.js 20+, npm, Python 3.11+, PM2, Nginx
#   - deploy/.env.production filled in
#   - PM2 started: pm2 start deploy/ecosystem.config.js (first time) or use this script
#
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$DEPLOY_DIR")"
ENV_FILE="$DEPLOY_DIR/.env.production"

echo "==> PremiumBlog deploy"
echo "    App dir:  $APP_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found." >&2
  echo "       cp deploy/.env.production.example deploy/.env.production && nano deploy/.env.production" >&2
  exit 1
fi

# Load env (NEXT_PUBLIC_* vars are inlined at build time)
set -a
# shellcheck disable=SC1091
source "$ENV_FILE"
set +a

# ------------------------------------------------------------
# 1. Install dependencies
# ------------------------------------------------------------
echo "==> Installing npm dependencies..."
(cd "$APP_DIR/frontend" && npm install --no-audit --no-fund)
(cd "$APP_DIR/admin" && npm install --no-audit --no-fund)

# ------------------------------------------------------------
# 2. Copy env into each Next.js app (used at build AND runtime)
# ------------------------------------------------------------
cp "$ENV_FILE" "$APP_DIR/frontend/.env.production"
cp "$ENV_FILE" "$APP_DIR/admin/.env.production"

# ------------------------------------------------------------
# 3. Prisma: sync schema to sqlite + generate client + seed
# ------------------------------------------------------------
echo "==> Setting up Prisma (sqlite)..."
# NOTE: intentionally WITHOUT --accept-data-loss — destructive schema changes will
# error out instead of wiping your production database. For such changes, back up
# admin/prisma/dev.db first, then push manually: npx prisma db push
(cd "$APP_DIR/admin" && npx prisma db push --skip-generate)
(cd "$APP_DIR/admin" && npx prisma generate)
(cd "$APP_DIR/admin" && npx tsx prisma/seed.ts || echo "⚠ seed skipped/failed — check that the admin user exists")

# ------------------------------------------------------------
# 4. Build Next.js apps
# ------------------------------------------------------------
echo "==> Building Next.js apps..."
(cd "$APP_DIR/frontend" && npm run build)
(cd "$APP_DIR/admin" && npm run build)

# ------------------------------------------------------------
# 5. Backend: venv + packages + static files + migrations
# ------------------------------------------------------------
echo "==> Setting up Django backend..."
if [ ! -d "$APP_DIR/backend/venv" ]; then
  (cd "$APP_DIR/backend" && python3 -m venv venv)
fi
(cd "$APP_DIR/backend" && ./venv/bin/pip install -r requirements.txt)
(cd "$APP_DIR/backend" && ./venv/bin/python manage.py migrate --noinput)
(cd "$APP_DIR/backend" && ./venv/bin/python manage.py collectstatic --noinput)

# ------------------------------------------------------------
# 6. Restart via PM2
# ------------------------------------------------------------
echo "==> Restarting PM2 apps..."
pm2 startOrReload "$DEPLOY_DIR/ecosystem.config.js"
pm2 save

echo ""
echo "✅ Deploy complete!"
echo "   Frontend: ${FRONTEND_URL:-http://localhost:3000}"
echo "   Admin:    ${ADMIN_URL:-http://localhost:3001}"
echo ""
echo "   Check status:   pm2 status"
echo "   Check logs:     pm2 logs frontend / admin / backend"
