// PM2 ecosystem file — run with: pm2 start deploy/ecosystem.config.js
//
// Paths below assume the project lives at /var/www/premiumblog
// (see deploy/README.md for the full setup guide).

module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "/var/www/premiumblog/frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
      },
      env_file: "/var/www/premiumblog/deploy/.env.production",
    },
    {
      name: "admin",
      cwd: "/var/www/premiumblog/admin",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
      },
      env_file: "/var/www/premiumblog/deploy/.env.production",
    },
    {
      name: "backend",
      cwd: "/var/www/premiumblog/backend",
      script: "venv/bin/gunicorn",
      args: "core.wsgi:application --bind 127.0.0.1:8000 --workers 2 --timeout 90 --access-logfile - --error-logfile -",
      interpreter: "none",
      autorestart: true,
      max_memory_restart: "400M",
      env: {
        PYTHONUNBUFFERED: "1",
      },
      env_file: "/var/www/premiumblog/deploy/.env.production",
    },
  ],
};
