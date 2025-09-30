import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Eye, ArrowLeft, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  publishedAt?: Date;
  tags: string[];
  views: number;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  createdAt: Date;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    return null;
  }

  // Incrémenter les vues
  await prisma.blogPost.update({
    where: { slug },
    data: { views: { increment: 1 } },
  });

  return post as BlogPost;
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const readingTime = Math.ceil(post.content.split(/\s+/).length / 200);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-semibold text-amber-600 transition hover:text-amber-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="mx-auto max-w-4xl px-6 py-12">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-neutral-600">
          <div className="flex items-center gap-2">
            {post.author.image ? (
              <img
                src={post.author.image}
                alt={post.author.name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                {post.author.name[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-neutral-900">{post.author.name}</p>
              <p className="text-xs text-neutral-500">{post.author.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {post.publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {readingTime} min de lecture
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.views} vues
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-6 text-4xl font-bold text-neutral-900 sm:text-5xl">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="mb-8 text-xl text-neutral-600">{post.excerpt}</p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <Tag className="h-4 w-4 text-neutral-500" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-neutral-900 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-neutral-900 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-neutral-900 prose-pre:text-neutral-100">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Back to blog */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-amber-600 transition hover:text-amber-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux articles
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-12 text-center text-sm text-neutral-500">
          <p>
            © {new Date().getFullYear()} Easy Cron Jobs. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}