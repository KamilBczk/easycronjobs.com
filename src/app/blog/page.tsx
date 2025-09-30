import Link from "next/link";
import { Calendar, Clock, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: Date;
  tags: string[];
  views: number;
  author: {
    name: string;
    image?: string;
  };
}

async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return posts as BlogPost[];
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold text-amber-600 transition hover:text-amber-700"
          >
            ← Easy Cron Jobs
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
          📝 Blog
        </span>
        <h1 className="mt-4 text-4xl font-bold text-neutral-900 sm:text-5xl">
          Actualités & Tutoriels
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Découvrez nos articles sur l'automatisation, les cron jobs et les
          bonnes pratiques DevOps
        </p>
      </section>

      {/* Posts Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        {posts.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center">
            <p className="text-neutral-600">
              Aucun article publié pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {post.coverImage && (
                  <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-neutral-900 transition group-hover:text-amber-600">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mb-4 flex-1 text-sm text-neutral-600 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500">
                    <div className="flex items-center gap-2">
                      {post.author.image ? (
                        <img
                          src={post.author.image}
                          alt={post.author.name}
                          className="h-6 w-6 rounded-full"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                          {post.author.name[0]}
                        </div>
                      )}
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} Easy Cron Jobs. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}