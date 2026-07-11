# Top Blog - Full-Stack Blog Platform

A modern, full-stack blog platform built with **Next.js** (Admin Panel & Frontend) and **Django** (Backend API).

## 🏗️ Project Structure

```
packages/
├── admin/          # Next.js Admin Panel (Dashboard, Auth, Content Management)
├── frontend/       # Next.js Frontend (Public Blog, Reading Experience)
├── backend/        # Django Backend (REST API, Database Models)
└── package.json    # Root workspace config
```

## 🚀 Tech Stack

### Admin Panel (`admin/`)
- **Next.js 14** (App Router)
- **Prisma ORM** (SQLite/PostgreSQL)
- **NextAuth.js** (Authentication)
- **Tailwind CSS** (UI)
- **shadcn/ui** (Components)

### Frontend (`frontend/`)
- **Next.js 14** (App Router)
- **Tailwind CSS** (Styling)
- **Server Components** (Performance)
- **Reading Experience** (Table of Contents, Progress Bar, Theme Toggle)

### Backend (`backend/`)
- **Django** (Python)
- **Django REST Framework** (API)
- **SQLite** (Database)

## ✨ Features

- 📝 **Rich Blog Editor** - Create and manage posts with rich text editing
- 🎨 **Modern Reading Experience** - Table of contents, reading progress, dark mode
- 🔐 **Admin Dashboard** - Secure authentication, user management, analytics
- 📧 **Newsletter System** - Email subscriptions with verification
- 💬 **Comments System** - Public comments with moderation
- 🏷️ **Categories & Tags** - Organize content effectively
- 🔍 **SEO Optimized** - Meta tags, structured data, sitemaps
- 📱 **Responsive Design** - Works on all devices
- 🛡️ **Security Features** - Rate limiting, audit logs, security settings

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm or yarn

### 1. Admin Panel Setup
```bash
cd packages/admin
npm install
cp .env.example .env  # Configure your environment variables
npx prisma db push
npm run dev
```

### 2. Frontend Setup
```bash
cd packages/frontend
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd packages/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## 🌐 Environment Variables

### Admin Panel (`admin/.env`)
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
NEXT_PUBLIC_ADMIN_URL="http://localhost:3001"
```

## 📄 License

All Rights Reserved.

Copyright (c) 2026 Top Blog. This project is proprietary and not open for use, modification, or distribution without explicit permission.
