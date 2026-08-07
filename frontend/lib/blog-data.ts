export interface BlogPost {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image: string;
  author: { name: string; avatar: string; bio: string };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
}

// Use NEXT_PUBLIC_ prefix so this works in both server and client components
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";

// Hardcoded fallback posts
const fallbackPosts: BlogPost[] = [
  {
    id: 1,
    title: "Getting Started with Next.js 14",
    slug: "getting-started-nextjs-14",
    content: `<p class="lead">Next.js 14 brings powerful new features that make building web applications easier than ever.</p>
    <h2>Key Features</h2>
    <ul><li><strong>App Router</strong>: A new paradigm for routing</li><li><strong>Server Components</strong>: Render components on the server</li><li><strong>Streaming</strong>: Progressive rendering for faster page loads</li></ul>
    <h2>Why Next.js?</h2><p>Next.js provides the best developer experience with features like automatic code splitting, fast refresh, built-in CSS support, and API routes.</p>
    <blockquote>"Next.js is the most popular React framework for production-grade applications."</blockquote>
    <p>Get started today and experience the future of web development!</p>`,
    excerpt: "Learn the basics of Next.js 14 and its powerful new features for building modern web applications.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    author: { name: "John Doe", avatar: "", bio: "Senior Full-Stack Developer with 10+ years of experience." },
    category: "Technology",
    tags: ["JavaScript", "React", "Next.js", "Web Dev"],
    publishedAt: "2026-07-08T10:00:00Z",
    readTime: "8 min read",
    views: 1234,
    likes: 89,
  },
  {
    id: 2,
    title: "Modern CSS Techniques in 2026",
    slug: "modern-css-techniques-2026",
    content: `<p class="lead">CSS has evolved significantly. Here are the techniques every developer should know.</p>
    <h2>CSS Grid & Subgrid</h2><p>CSS Grid has become the go-to layout system for modern web design.</p>
    <h2>Container Queries</h2><p>Container queries allow you to style elements based on their container's size rather than the viewport.</p>
    <h2>The :has() Selector</h2><p>The :has() selector enables parent selection based on child elements, opening up new possibilities for styling.</p>
    <p>Master these techniques to build better, more responsive websites.</p>`,
    excerpt: "Explore the latest CSS techniques including Grid, Container Queries, and the :has() selector.",
    image: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=1200&q=80",
    author: { name: "Jane Smith", avatar: "", bio: "Frontend Developer & CSS enthusiast." },
    category: "Design",
    tags: ["CSS", "Web Dev", "Design"],
    publishedAt: "2026-07-07T10:00:00Z",
    readTime: "6 min read",
    views: 856,
    likes: 62,
  },
  {
    id: 3,
    title: "Building Scalable APIs with Next.js and Prisma",
    slug: "building-scalable-apis",
    content: `<p class="lead">Learn how to build production-ready APIs using Next.js API routes and Prisma ORM with PostgreSQL.</p>
    <h2>Setup</h2><p>Start by creating a Next.js project and installing Prisma. Configure your database connection and define your schema.</p>
    <pre><code class="language-bash">npm install prisma @prisma/client
npx prisma init</code></pre>
    <h2>API Routes</h2><p>Next.js API routes provide a straightforward way to build your backend endpoints.</p>
    <pre><code class="language-javascript">export async function GET(req) {
  const data = await prisma.post.findMany();
  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const post = await prisma.post.create({
    data: body,
  });
  return NextResponse.json(post, { status: 201 });
}</code></pre>
    <h2>Best Practices</h2><p>Always validate input, handle errors gracefully, and use proper HTTP status codes.</p><pre><code class="language-typescript">interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
}</code></pre>`,
    excerpt: "A comprehensive guide to building production-ready APIs using Next.js API routes and Prisma.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    author: { name: "Mike Johnson", avatar: "", bio: "Backend Developer & API architect." },
    category: "Development",
    tags: ["Next.js", "Prisma", "API", "Backend"],
    publishedAt: "2026-07-06T10:00:00Z",
    readTime: "10 min read",
    views: 432,
    likes: 45,
  },
  {
    id: 4,
    title: "TypeScript Best Practices for Large Projects",
    slug: "typescript-best-practices",
    content: `<p class="lead">TypeScript helps catch errors early and improves code quality in large codebases.</p>
    <h2>Strict Mode</h2><p>Always enable strict mode for maximum type safety.</p>
    <h2>Utility Types</h2><p>Master TypeScript's utility types like Partial, Pick, Omit, and Record for cleaner code.</p>
    <h2>Generics</h2><p>Use generics to create reusable, type-safe components and functions.</p>
    <h2>Tips</h2><ul><li>Prefer interfaces over types for object shapes</li><li>Use discriminated unions for state management</li><li>Leverage type inference instead of explicit annotations</li></ul>`,
    excerpt: "Learn TypeScript best practices for building maintainable, type-safe applications at scale.",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80",
    author: { name: "Sarah Wilson", avatar: "", bio: "Full-Stack Developer & TypeScript advocate." },
    category: "Development",
    tags: ["TypeScript", "JavaScript", "Web Dev"],
    publishedAt: "2026-07-05T10:00:00Z",
    readTime: "7 min read",
    views: 567,
    likes: 78,
  },
  {
    id: 5,
    title: "Design Systems: Building Consistent Experiences",
    slug: "design-systems-guide",
    content: `<p class="lead">A comprehensive guide to creating and maintaining design systems for scalable web applications.</p>
    <h2>What is a Design System?</h2><p>A design system is a collection of reusable components and guidelines that ensure visual consistency across your product.</p>
    <h2>Key Components</h2><ul><li>Design tokens (colors, typography, spacing)</li><li>Component library</li><li>Documentation</li><li>Code guidelines</li></ul>
    <h2>Getting Started</h2><p>Start small with a token system, then gradually build out your component library.</p>`,
    excerpt: "A comprehensive guide to creating and maintaining design systems for scalable web applications.",
    image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=80",
    author: { name: "Emily Davis", avatar: "", bio: "UI/UX Designer & Design Systems specialist." },
    category: "Design",
    tags: ["Design", "UI/UX", "Components"],
    publishedAt: "2026-07-04T10:00:00Z",
    readTime: "9 min read",
    views: 789,
    likes: 92,
  },
  {
    id: 6,
    title: "The Future of Web Development",
    slug: "future-web-development-2026",
    content: `<p class="lead">Web development is evolving at an unprecedented pace. As we move through 2026, new technologies are reshaping how we build for the web.</p>
    <h2>The Rise of AI-Assisted Development</h2><p>Artificial intelligence has transformed from a buzzword to an essential tool in every developer's toolkit.</p>
    <blockquote>"The best developers in 2026 won't be those who write the most code, but those who most effectively leverage AI."</blockquote>
    <h2>Edge Computing Goes Mainstream</h2><p>With the proliferation of edge computing platforms, applications are becoming faster and more responsive than ever.</p>
    <h2>WebAssembly: Beyond the Browser</h2><p>WebAssembly is becoming a viable option for server-side applications, plugins, and standalone programs.</p>`,
    excerpt: "Explore the latest trends shaping web development in 2026, from AI-assisted coding to edge computing.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    author: { name: "Alex Chen", avatar: "", bio: "Tech writer & full-stack developer." },
    category: "Technology",
    tags: ["AI", "Web Development", "Edge Computing", "Wasm"],
    publishedAt: "2026-07-03T10:00:00Z",
    readTime: "12 min read",
    views: 2341,
    likes: 156,
  },
  {
    id: 7,
    title: "Building an AI Chatbot with OpenAI API and Node.js",
    slug: "building-ai-chatbot-openai",
    content: `<p class="lead">Learn how to build a production-ready AI chatbot using OpenAI's GPT API with streaming responses and conversation memory.</p>
    <h2>Installation</h2>
    <pre><code class="language-bash">npm install openai dotenv
# or
yarn add openai dotenv</code></pre>
    <h2>Basic Chat Completion</h2>
    <pre><code class="language-javascript">import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatResponse(message) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: message },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
}</code></pre>
    <h2>Streaming Response</h2>
    <pre><code class="language-javascript">export async function streamChatResponse(message) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: message }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
}</code></pre>`,
    excerpt: "A step-by-step guide to building a production-ready AI chatbot using OpenAI's GPT-4 API.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad095?auto=format&fit=crop&w=1200&q=80",
    author: { name: "Priya Sharma", avatar: "", bio: "AI Engineer specializing in LLM applications." },
    category: "AI",
    tags: ["AI", "OpenAI", "Chatbot"],
    publishedAt: "2026-07-10T10:00:00Z",
    readTime: "14 min read",
    views: 3456,
    likes: 234,
  },
];

function mapApiPostToBlogPost(apiPost: any): BlogPost {
  const categoryName = apiPost.categories?.[0]?.name || "General";
  const tagNames = apiPost.tags?.map((t: any) => t.name) || [];
  const authorName = apiPost.author?.name || "Admin";
  const readTime = `${Math.max(1, Math.ceil((apiPost.content?.length || 0) / 3000))} min read`;

  return {
    id: apiPost.id,
    title: apiPost.title,
    slug: apiPost.slug,
    content: apiPost.content || "",
    excerpt: apiPost.excerpt || apiPost.title,
    image: apiPost.featuredImg || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    author: {
      name: authorName,
      avatar: "",
      bio: "Author",
    },
    category: categoryName,
    tags: tagNames,
    publishedAt: apiPost.createdAt || new Date().toISOString(),
    readTime,
    views: apiPost.views || 0,
    likes: 0,
  };
}

export async function fetchAllPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/posts/public?limit=100`, {
      cache: "no-cache",
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      const apiPosts = (data.posts || []).map(mapApiPostToBlogPost);

      // Merge with fallback posts (avoid duplicates by slug)
      // Put API posts FIRST so new posts appear before hardcoded ones
      const fallbackSlugs = new Set(fallbackPosts.map((p) => p.slug));
      const uniqueApiPosts = apiPosts.filter((p: BlogPost) => !fallbackSlugs.has(p.slug));
      const merged = [...uniqueApiPosts, ...fallbackPosts];
      return merged;
    }
  } catch (err) {
    console.warn("Failed to fetch posts from admin API, using fallback data:", err);
  }

  return fallbackPosts;
}

export async function fetchPostBySlug(
  slug: string,
  preview?: string
): Promise<BlogPost | undefined> {
  // Check fallback posts first
  const fallback = fallbackPosts.find((p) => p.slug === slug);
  if (fallback) return fallback;

  // Try admin API
  try {
    const params = new URLSearchParams({ slug });
    if (preview) params.set("preview", preview);
    const response = await fetch(`${ADMIN_API_URL}/api/posts/public?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.post) {
        return mapApiPostToBlogPost(data.post);
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch post "${slug}" from admin API:`, err);
  }

  return undefined;
}

export function getAllPostsSync(): BlogPost[] {
  return fallbackPosts;
}

export function getPostBySlugSync(slug: string): BlogPost | undefined {
  return fallbackPosts.find((p) => p.slug === slug);
}

// For backwards compatibility with sync usage (home page, etc.)
export const getAllPosts = getAllPostsSync;
export const getPostBySlug = getPostBySlugSync;
export const getPostById = (id: number): BlogPost | undefined =>
  fallbackPosts.find((p) => p.id === id);
