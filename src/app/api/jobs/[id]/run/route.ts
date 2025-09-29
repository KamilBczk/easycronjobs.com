import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// POST /api/jobs/[id]/run - Lancer un job manuellement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le job existe
    const job = await prisma.job.findUnique({
      where: { id: id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job non trouvé" }, { status: 404 });
    }

    // Créer une nouvelle exécution
    const jobRun = await prisma.jobRun.create({
      data: {
        jobId: id,
        state: "QUEUED",
        attempts: 1,
      },
    });

    // TODO: Ici vous pourriez ajouter la logique pour vraiment exécuter le job
    // Pour l'instant, on simule juste le fait qu'il soit en queue

    return NextResponse.json({
      success: true,
      run: jobRun,
      message: "Job ajouté à la queue d'exécution"
    });
  } catch (error) {
    console.error("Erreur lors du lancement du job:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}