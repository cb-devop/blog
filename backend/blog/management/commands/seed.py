import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from blog.models import Category, Tag, Post

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds the database with sample blog data"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        admin_password = os.environ.get("DJANGO_SEED_ADMIN_PASSWORD")
        if not admin_password:
            self.stdout.write(self.style.WARNING("  [SKIP] DJANGO_SEED_ADMIN_PASSWORD not set, skipping superuser creation"))
        elif not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                username="admin",
                email="admin@example.com",
                password=admin_password,
            )
            self.stdout.write(self.style.SUCCESS("  [OK] Superuser created (admin)"))

        # Create categories
        categories_data = [
            {"name": "Technology", "slug": "technology"},
            {"name": "Design", "slug": "design"},
            {"name": "Development", "slug": "development"},
            {"name": "Business", "slug": "business"},
            {"name": "Lifestyle", "slug": "lifestyle"},
        ]
        categories = {}
        for cat_data in categories_data:
            cat, created = Category.objects.get_or_create(**cat_data)
            categories[cat.slug] = cat
            if created:
                self.stdout.write(f"  [OK] Category created: {cat.name}")

        # Create tags
        tags_data = [
            "JavaScript", "Python", "React", "Next.js", "Django",
            "CSS", "TypeScript", "AI", "Web Dev", "Tutorial"
        ]
        tags = {}
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            tags[tag_name] = tag
            if created:
                self.stdout.write(f"  [OK] Tag created: {tag.name}")

        # Create posts
        user = User.objects.first()
        posts_data = [
            {
                "title": "Getting Started with Next.js 14",
                "slug": "getting-started-nextjs-14",
                "content": "# Getting Started with Next.js 14\n\nNext.js 14 brings powerful new features that make building web applications easier than ever.\n\n## Key Features\n\n- **App Router**: A new paradigm for routing\n- **Server Components**: Render components on the server\n- **Streaming**: Progressive rendering for faster page loads\n\n## Why Next.js?\n\nNext.js provides the best developer experience with features like:\n1. Automatic code splitting\n2. Fast refresh\n3. Built-in CSS support\n4. API routes\n\nGet started today and experience the future of web development!",
                "excerpt": "Learn the basics of Next.js 14 and its powerful new features for building modern web applications.",
                "category": "technology",
                "tags": ["JavaScript", "React", "Next.js", "Web Dev"],
                "status": "published",
            },
            {
                "title": "Modern CSS Techniques in 2026",
                "slug": "modern-css-techniques-2026",
                "content": "# Modern CSS Techniques in 2026\n\nCSS has evolved significantly. Here are the techniques every developer should know.\n\n## CSS Grid & Subgrid\n\nCSS Grid has become the go-to layout system for modern web design.\n\n## Container Queries\n\nContainer queries allow you to style elements based on their container's size.\n\n## The :has() Selector\n\nThe :has() selector enables parent selection based on child elements.\n\nMaster these techniques to build better, more responsive websites.",
                "excerpt": "Explore the latest CSS techniques including Grid, Container Queries, and the :has() selector.",
                "category": "design",
                "tags": ["CSS", "Web Dev"],
                "status": "published",
            },
            {
                "title": "Building APIs with Django REST Framework",
                "slug": "building-apis-django-rest-framework",
                "content": "# Building APIs with Django REST Framework\n\nDjango REST Framework makes it easy to build powerful, scalable APIs.\n\n## Setup\n\nInstall DRF and add it to your INSTALLED_APPS.\n\n## Serializers\n\nSerializers convert complex data types to JSON.\n\n## ViewSets\n\nViewSets combine the logic for multiple views into a single class.\n\n## Authentication\n\nDRF provides built-in authentication classes.\n\nBuild production-ready APIs with Django REST Framework!",
                "excerpt": "A comprehensive guide to building RESTful APIs using Django REST Framework.",
                "category": "development",
                "tags": ["Python", "Django", "Web Dev", "Tutorial"],
                "status": "published",
            },
            {
                "title": "TypeScript Best Practices for Large Projects",
                "slug": "typescript-best-practices",
                "content": "# TypeScript Best Practices for Large Projects\n\nTypeScript helps catch errors early and improves code quality.\n\n## Strict Mode\n\nAlways enable strict mode for maximum type safety.\n\n## Utility Types\n\nMaster TypeScript's utility types for cleaner code.\n\n## Generics\n\nUse generics to create reusable, type-safe components.\n\n## Tips\n\n1. Prefer interfaces over types\n2. Use discriminated unions\n3. Leverage type inference\n\nWrite better TypeScript starting today!",
                "excerpt": "Learn TypeScript best practices for building maintainable, type-safe applications at scale.",
                "category": "development",
                "tags": ["TypeScript", "JavaScript", "Web Dev"],
                "status": "published",
            },
        ]

        for post_data in posts_data:
            post, created = Post.objects.get_or_create(
                slug=post_data["slug"],
                defaults={
                    "title": post_data["title"],
                    "content": post_data["content"],
                    "excerpt": post_data["excerpt"],
                    "author": user,
                    "category": categories.get(post_data["category"]),
                    "status": post_data["status"],
                    "reading_time": 5,
                },
            )
            if created:
                for tag_name in post_data["tags"]:
                    if tag_name in tags:
                        post.tags.add(tags[tag_name])
                self.stdout.write(f"  [OK] Post created: {post.title}")

        self.stdout.write(self.style.SUCCESS("\n[DONE] Database seeded successfully!"))
        if admin_password:
            self.stdout.write(f"   Admin login: admin (password from DJANGO_SEED_ADMIN_PASSWORD)")
        self.stdout.write(f"   Posts: {Post.objects.count()}")
        self.stdout.write(f"   Categories: {Category.objects.count()}")
        self.stdout.write(f"   Tags: {Tag.objects.count()}")
