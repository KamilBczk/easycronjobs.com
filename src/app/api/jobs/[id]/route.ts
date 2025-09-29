import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formDataToJobUpdate, jobToFormData } from "@/lib/job-utils";

// GET /api/jobs/[id] - Récupérer un job spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur pour vérifier l'accès
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les équipes de l'utilisateur
    const userTeams = await prisma.team.findMany({
      where: {
        createdById: user.id,
      },
    });

    const teamIds = userTeams.map((team: any) => team.id);

    // Récupérer le job avec sa catégorie
    const job = await prisma.job.findFirst({
      where: {
        id: id,
        teamId: { in: teamIds },
      },
      include: {
        category: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job non trouvé" }, { status: 404 });
    }

    // Convertir le job en format de formulaire
    const formData = jobToFormData(job);
    return NextResponse.json({ job: formData });
  } catch (error) {
    console.error("Erreur lors de la récupération du job:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Mettre à jour un job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    // Validation : la catégorie est obligatoire
    if (!body.category || !body.category.trim()) {
      return NextResponse.json({ error: "La catégorie est requise" }, { status: 400 });
    }

    // Récupérer l'utilisateur pour obtenir son équipe
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les équipes de l'utilisateur
    const userTeams = await prisma.team.findMany({
      where: {
        createdById: user.id,
      },
    });

    const teamIds = userTeams.map((team: any) => team.id);

    // Vérifier que le job existe et appartient à l'utilisateur
    const existingJob = await prisma.job.findFirst({
      where: {
        id: id,
        teamId: { in: teamIds },
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job non trouvé" }, { status: 404 });
    }

    // Trouver l'ID de la catégorie par son nom
    const category = await prisma.jobCategory.findFirst({
      where: {
        name: body.category.trim(),
        teamId: { in: teamIds },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 400 });
    }

    // Convertir les données du formulaire au format Prisma
    const updateData = formDataToJobUpdate(body);
    // Remplacer le nom de catégorie par l'ID
    updateData.categoryId = category.id;

    // Mettre à jour le job
    const updatedJob = await prisma.job.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json({ job: updatedJob });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du job:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Supprimer un job
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

    // Vérifier que le job existe
    // TODO: Vérifier que l'utilisateur a accès à ce job via son équipe
    const existingJob = await prisma.job.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job non trouvé" }, { status: 404 });
    }

    // Supprimer le job
    await prisma.job.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du job:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
