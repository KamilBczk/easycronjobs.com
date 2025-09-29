import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/categories - Récupérer toutes les catégories de l'utilisateur
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur et ses équipes
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { teamMembers: { include: { team: true } } },
    });

    if (!user || user.teamMembers.length === 0) {
      return NextResponse.json({ error: "Aucune équipe trouvée" }, { status: 400 });
    }

    const teamId = user.teamMembers[0].teamId;

    // Récupérer les catégories de l'équipe
    const categories = await prisma.jobCategory.findMany({
      where: { teamId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Créer une nouvelle catégorie
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Le nom de la catégorie est requis" }, { status: 400 });
    }

    // Récupérer l'utilisateur et ses équipes
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { teamMembers: { include: { team: true } } },
    });

    if (!user || user.teamMembers.length === 0) {
      return NextResponse.json({ error: "Aucune équipe trouvée" }, { status: 400 });
    }

    const teamId = user.teamMembers[0].teamId;

    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.jobCategory.findFirst({
      where: {
        teamId,
        name: name.trim(),
      },
    });

    if (existingCategory) {
      return NextResponse.json({ error: "Cette catégorie existe déjà" }, { status: 400 });
    }

    // Créer la nouvelle catégorie
    const category = await prisma.jobCategory.create({
      data: {
        teamId,
        name: name.trim(),
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}