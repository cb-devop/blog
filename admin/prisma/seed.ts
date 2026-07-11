import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" }),
});

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Users ──
  let adminUser = await prisma.user.findUnique({ where: { email: "admin@premiumblog.com" } });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    adminUser = await prisma.user.create({
      data: { name: "Admin User", email: "admin@premiumblog.com", password: hashedPassword, role: "ADMIN" },
    });
    console.log("✅ Created admin user: admin@premiumblog.com / Admin@123");
  } else {
    console.log("✅ Admin user already exists");
  }

  let editorUser = await prisma.user.findUnique({ where: { email: "editor@premiumblog.com" } });
  if (!editorUser) {
    const hashedPassword = await bcrypt.hash("Editor@123", 12);
    editorUser = await prisma.user.create({
      data: { name: "Editor User", email: "editor@premiumblog.com", password: hashedPassword, role: "EDITOR" },
    });
    console.log("✅ Created editor user: editor@premiumblog.com / Editor@123");
  } else {
    console.log("✅ Editor user already exists");
  }

  // ── Categories ──
  const categoryData = [
    { name: "Technology", slug: "technology", description: "Latest tech news and tutorials" },
    { name: "Design", slug: "design", description: "UI/UX design and creative content" },
    { name: "Development", slug: "development", description: "Web development guides and best practices" },
    { name: "AI", slug: "ai", description: "Artificial intelligence and machine learning" },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoryData) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      categories[cat.name] = existing.id;
    } else {
      const created = await prisma.category.create({ data: cat });
      categories[cat.name] = created.id;
      console.log(`  ✅ Created category: ${cat.name}`);
    }
  }

  // ── Tags ──
  const tagData = [
    { name: "JavaScript", slug: "javascript" },
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextjs" },
    { name: "Web Dev", slug: "web-dev" },
    { name: "CSS", slug: "css" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Python", slug: "python" },
    { name: "AI", slug: "ai" },
    { name: "Machine Learning", slug: "machine-learning" },
    { name: "LLM", slug: "llm" },
    { name: "API", slug: "api" },
    { name: "Backend", slug: "backend" },
    { name: "Design", slug: "design" },
    { name: "UI/UX", slug: "ui-ux" },
    { name: "OpenAI", slug: "openai" },
    { name: "GPT", slug: "gpt" },
    { name: "Node.js", slug: "nodejs" },
  ];

  const tags: Record<string, string> = {};
  for (const tag of tagData) {
    const existing = await prisma.tag.findUnique({ where: { slug: tag.slug } });
    if (existing) {
      tags[tag.name] = existing.id;
    } else {
      const created = await prisma.tag.create({ data: tag });
      tags[tag.name] = created.id;
    }
  }
  console.log(`✅ Created/verified ${tagData.length} tags`);

  // ── Posts ──
  const postsData = [
    {
      title: "Getting Started with Next.js 14",
      slug: "getting-started-nextjs-14",
      content: `<p>Next.js 14 brings powerful new features that make building web applications easier than ever.</p><h2>Key Features</h2><ul><li><strong>App Router</strong>: A new paradigm for routing</li><li><strong>Server Components</strong>: Render components on the server</li><li><strong>Streaming</strong>: Progressive rendering for faster page loads</li></ul><p>Get started today and experience the future of web development!</p>`,
      excerpt: "Learn the basics of Next.js 14 and its powerful new features for building modern web applications.",
      featuredImg: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "Technology",
      tagNames: ["JavaScript", "React", "Next.js", "Web Dev"],
      views: 1234,
    },
    {
      title: "Modern CSS Techniques in 2026",
      slug: "modern-css-techniques-2026",
      content: `<p>CSS has evolved significantly. Here are the techniques every developer should know.</p><h2>CSS Grid & Subgrid</h2><p>CSS Grid has become the go-to layout system for modern web design.</p><h2>Container Queries</h2><p>Container queries allow you to style elements based on their container's size rather than the viewport.</p>`,
      excerpt: "Explore the latest CSS techniques including Grid, Container Queries, and the :has() selector.",
      featuredImg: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "Design",
      tagNames: ["CSS", "Web Dev", "Design"],
      views: 856,
    },
    {
      title: "Building Scalable APIs with Next.js and Prisma",
      slug: "building-scalable-apis",
      content: `<p>Learn how to build production-ready APIs using Next.js API routes and Prisma ORM with PostgreSQL.</p><h2>Setup</h2><p>Start by creating a Next.js project and installing Prisma. Configure your database connection and define your schema.</p><h2>API Routes</h2><p>Next.js API routes provide a straightforward way to build your backend endpoints.</p><pre><code class="language-javascript">export async function GET(req) {\n  const data = await prisma.post.findMany();\n  return NextResponse.json(data);\n}</code></pre><h2>Best Practices</h2><p>Always validate input, handle errors gracefully, and use proper HTTP status codes.</p>`,
      excerpt: "A comprehensive guide to building production-ready APIs using Next.js API routes and Prisma.",
      featuredImg: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "Development",
      tagNames: ["Next.js", "API", "Backend"],
      views: 432,
    },
    {
      title: "TypeScript Best Practices for Large Projects",
      slug: "typescript-best-practices",
      content: `<p>TypeScript helps catch errors early and improves code quality in large codebases.</p><h2>Strict Mode</h2><p>Always enable strict mode for maximum type safety.</p><h2>Utility Types</h2><p>Master TypeScript's utility types like Partial, Pick, Omit, and Record.</p>`,
      excerpt: "Learn TypeScript best practices for building maintainable, type-safe applications at scale.",
      featuredImg: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "Development",
      tagNames: ["TypeScript", "JavaScript", "Web Dev"],
      views: 567,
    },
    {
      title: "Design Systems: Building Consistent Experiences",
      slug: "design-systems-guide",
      content: `<p>A comprehensive guide to creating and maintaining design systems for scalable web applications.</p><h2>What is a Design System?</h2><p>A design system is a collection of reusable components and guidelines.</p>`,
      excerpt: "A comprehensive guide to creating and maintaining design systems for scalable web applications.",
      featuredImg: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "Design",
      tagNames: ["Design", "UI/UX"],
      views: 789,
    },
    {
      title: "The Future of Web Development in 2026",
      slug: "future-web-development-2026",
      content: `<p>Web development is evolving at an unprecedented pace. New technologies are reshaping how we build for the web.</p><h2>The Rise of AI-Assisted Development</h2><p>Artificial intelligence has become an essential tool in every developer's toolkit.</p>`,
      excerpt: "Explore the latest trends shaping web development in 2026, from AI-assisted coding to edge computing.",
      featuredImg: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "Technology",
      tagNames: ["AI", "Web Dev", "JavaScript"],
      views: 2341,
    },
    {
      title: "Building an AI Chatbot with OpenAI API",
      slug: "building-ai-chatbot-openai",
      content: `<p>Learn how to build a production-ready AI chatbot using OpenAI's GPT API with streaming responses and conversation memory.</p><h2>Setting Up OpenAI</h2><p>First, install the OpenAI SDK and set up your API key.</p><pre><code class="language-bash">npm install openai dotenv\n# or\nyarn add openai dotenv</code></pre><h2>Basic Usage</h2><p>Here's how to create a simple chat completion:</p><pre><code class="language-javascript">import OpenAI from "openai";\n\nconst openai = new OpenAI({\n  apiKey: process.env.OPENAI_API_KEY,\n});\n\nconst response = await openai.chat.completions.create({\n  model: "gpt-4",\n  messages: [\n    { role: "user", content: "Hello!" }\n  ],\n});\n\nconsole.log(response.choices[0].message.content);</code></pre>`,
      excerpt: "A step-by-step guide to building a production-ready AI chatbot using OpenAI's GPT-4 API.",
      featuredImg: "https://images.unsplash.com/photo-1677442136019-21780ecad095?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "AI",
      tagNames: ["AI", "OpenAI", "GPT", "Node.js", "API"],
      views: 3456,
    },
    {
      title: "Machine Learning in the Browser with TensorFlow.js",
      slug: "machine-learning-tensorflowjs",
      content: `<p>Run machine learning models directly in the browser using TensorFlow.js.</p><h2>Getting Started</h2><p>Install the library and set up a simple linear regression model.</p>`,
      excerpt: "Learn to build, train, and deploy machine learning models directly in the browser using TensorFlow.js.",
      featuredImg: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "AI",
      tagNames: ["AI", "Machine Learning", "JavaScript", "Web Dev"],
      views: 2100,
    },
    {
      title: "Building RAG Systems with LangChain and Pinecone",
      slug: "rag-systems-langchain-pinecone",
      content: `<p>Retrieval-Augmented Generation (RAG) combines LLMs with external knowledge bases.</p><h2>What is RAG?</h2><p>RAG enhances LLM responses by retrieving relevant information.</p>`,
      excerpt: "Build a production-ready RAG system using LangChain, Pinecone vector database, and OpenAI embeddings.",
      featuredImg: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "AI",
      tagNames: ["AI", "LLM", "API", "Machine Learning"],
      views: 3678,
    },
    {
      title: "Prompt Engineering: Advanced Techniques",
      slug: "prompt-engineering-advanced",
      content: `<p>Master advanced prompt engineering techniques to get consistent, high-quality outputs from LLMs.</p><h2>Why Prompt Engineering Matters</h2><p>Well-crafted prompts can make the difference.</p>`,
      excerpt: "Master advanced prompt engineering techniques including chain-of-thought and few-shot learning.",
      featuredImg: "https://images.unsplash.com/photo-1677442136019-21780ecad095?auto=format&fit=crop&w=1200&q=80",
      status: "PUBLISHED",
      category: "AI",
      tagNames: ["AI", "LLM", "GPT", "OpenAI"],
      views: 5342,
    },
    {
      title: "Draft: Upcoming Features Preview",
      slug: "draft-upcoming-features",
      content: `<p>This is a draft post about upcoming features still in development.</p>`,
      excerpt: "A preview of upcoming features currently in development.",
      featuredImg: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&w=1200&q=80",
      status: "DRAFT",
      category: "Technology",
      tagNames: ["Web Dev", "JavaScript", "React"],
      views: 0,
    },
    {
      title: "Scheduled: Performance Optimization Guide",
      slug: "scheduled-performance-guide",
      content: `<p>Coming soon: A comprehensive guide to optimizing web application performance.</p>`,
      excerpt: "Upcoming guide on web performance optimization techniques and best practices.",
      featuredImg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      status: "SCHEDULED",
      category: "Development",
      tagNames: ["Web Dev", "JavaScript", "CSS"],
      views: 0,
    },
  ];

  let postsCreated = 0;
  for (const postData of postsData) {
    const existing = await prisma.post.findUnique({ where: { slug: postData.slug } });
    if (existing) {
      continue;
    }

    const categoryId = categories[postData.category];
    const tagRecords = postData.tagNames
      .map((name) => tags[name])
      .filter(Boolean)
      .map((id) => ({ id }));

    await prisma.post.create({
      data: {
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        excerpt: postData.excerpt,
        featuredImg: postData.featuredImg,
        status: postData.status,
        views: postData.views,
        authorId: adminUser!.id,
        categories: { connect: [{ id: categoryId }] },
        tags: { connect: tagRecords },
        createdAt: new Date(Date.now() - (postsData.length - postsCreated) * 86400000),
        seoTitle: postData.title,
        seoDesc: postData.excerpt?.substring(0, 160),
      },
    });
    postsCreated++;
    console.log(`  ✅ Created post: ${postData.title} [${postData.status}]`);
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Categories: ${await prisma.category.count()}`);
  console.log(`   Tags: ${await prisma.tag.count()}`);
  console.log(`   Posts: ${await prisma.post.count()}`);
  console.log(`\n✨ Database seeded successfully!`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
