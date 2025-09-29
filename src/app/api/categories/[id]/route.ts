import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/categories/[id] - Supprimer une catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que la catégorie existe et appartient à l'utilisateur
    const category = await prisma.jobCategory.findUnique({
      where: { id },
      include: {
        team: { include: { members: true } },
        jobs: true
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    // Vérifier que l'utilisateur fait partie de l'équipe
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const isMember = category.team.members.some(member => member.userId === user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Vérifier s'il y a des jobs dans cette catégorie
    if (category.jobs.length > 0) {
      return NextResponse.json({
        error: "Impossible de supprimer une catégorie qui contient des jobs"
      }, { status: 400 });
    }

    // Supprimer la catégorie
    await prisma.jobCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}