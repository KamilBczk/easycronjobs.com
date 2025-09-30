import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/blog/slug/[slug] - Récupérer un article par son slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const session = await auth();
    const isAdmin = session?.user?.email
      ? (await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { isAdmin: true },
        }))?.isAdmin
      : false;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Si l'article est en draft, seul un admin peut le voir
    if (post.status === "DRAFT" && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Incrémenter les vues pour les articles publiés
    if (post.status === "PUBLISHED") {
      await prisma.blogPost.update({
        where: { slug },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching blog post by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}