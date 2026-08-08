# 🚀 PremiumBlog — Production Deployment Guide (Ubuntu VPS)

Complete setup for running the blog on an Ubuntu VPS with Nginx + PM2.

**Architecture**

```
Internet
   │
   ▼
Nginx (80/443)
   ├── blog.example.com ──► frontend  (Next.js, 127.0.0.1:3000)
   └── admin.example.com ─► admin     (Next.js + Prisma/SQLite, 127.0.0.1:3001)
                              └── backend (Django/gunicorn, 127.0.0.1:8000, internal)
```

**Recommended server:** 2 vCPU / 4 GB RAM / 40 GB SSD (2 GB RAM minimum works with swap).

---

## 1. Server preparation

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20+ (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11+ and build tools
sudo apt install -y python3 python3-venv python3-pip build-essential

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Swap (recommended for 2GB servers)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 2. DNS records

Point these **A records** at your VPS IP:

| Host | Type | Value |
|---|---|---|
| `blog` | A | `<vps-ip>` |
| `admin` | A | `<vps-ip>` |

## 3. Upload the project

```bash
sudo mkdir -p /var/www && sudo chown $USER /var/www
cd /var/www
git clone <your-repo-url> premiumblog   # or rsync/scp the project
cd premiumblog
```

## 4. Environment file

```bash
cd deploy
cp .env.production.example .env.production
nano .env.production
```

Fill in:
- `FRONTEND_URL` / `ADMIN_URL` — your domains
- `JWT_SECRET` → `openssl rand -hex 32`
- `DJANGO_SECRET_KEY` → `openssl rand -hex 32`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=blog.example.com,admin.example.com`
- `AI_API_KEY` — the AI Writer API key (any provider). This takes priority
  over any key typed into the admin Settings UI. For Google Gemini you can
  use `GEMINI_API_KEY` instead. Keep it here — never in `admin/data/settings.json`.

## 5. Deploy (one command)

```bash
cd /var/www/premiumblog
bash deploy/deploy.sh
```

This installs dependencies, syncs the Prisma/SQLite schema, seeds the admin
user (`admin@premiumblog.com` — set ADMIN_SEED_PASSWORD env var before running),
builds both Next.js apps, sets up the Django venv, and starts everything under PM2.

## 6. Nginx + HTTPS

```bash
# Install the site config
sudo cp deploy/nginx.conf /etc/nginx/sites-available/premiumblog
sudo ln -s /etc/nginx/sites-available/premiumblog /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # remove default site
sudo nginx -t && sudo systemctl reload nginx

# HTTPS (free SSL certificates)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d blog.example.com -d admin.example.com
```

## 7. PM2 auto-start on reboot

```bash
pm2 startup   # run the printed command with sudo
pm2 save
```

## 8. Firewall (UFW)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## Everyday workflow

**Deploy a new version:**
```bash
cd /var/www/premiumblog
git pull
bash deploy/deploy.sh
```

**Check status / logs:**
```bash
pm2 status
pm2 logs frontend      # or admin / backend
```

**Manual restarts:**
```bash
pm2 restart frontend admin backend
```

---

## ⚠️ Important notes

1. **Settings persist to disk** — site, SMTP, AI & security settings are
   saved to `admin/data/*.json` (gitignored) and survive restarts. On a fresh
   deploy, that folder doesn't exist yet, so the admin panel starts with
   defaults until you re-save your settings. Back it up along with the DB.

2. **SQLite single-process** — the Next.js apps run with `instances: 1`
   (fork mode) so SQLite writes are safe. Don't scale admin to multiple
   instances without switching to PostgreSQL.

3. **Change the default admin password** after first login.

4. **Backups** — back up these files regularly:
   - `admin/prisma/dev.db` (posts, users, comments)
   - `admin/data/` (site settings, SMTP/AI keys, security settings)
   - `backend/db.sqlite3` (Django data)

5. **Build memory** — `next build` can peak at ~2 GB. On a 2 GB VPS make
   sure swap is enabled (step 1), or build locally and upload the `.next`
   folders instead.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `502 Bad Gateway` | `pm2 status` — is `frontend`/`admin` running? `pm2 logs` |
| Admin API 401 from blog | Check `NEXT_PUBLIC_ADMIN_API_URL` matches `ADMIN_URL` and was set **before** `next build` |
| `bad host header` / 400 | Update `DJANGO_ALLOWED_HOSTS` in `deploy/.env.production` |
| CORS errors | Check `FRONTEND_URL` in admin env matches the blog domain exactly |
| Ports in use | Nothing else may run on 3000/3001/8000 (e.g. stop dev servers) |
