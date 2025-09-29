import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formDataToJobUpdate, jobToFormData } from "@/lib/job-utils";

// GET /api/jobs - Récupérer tous les jobs de l'utilisateur
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur
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

    // Récupérer les jobs des équipes de l'utilisateur
    const jobs = await prisma.job.findMany({
      where: {
        teamId: {
          in: teamIds,
        },
      },
      include: {
        category: true,
        runs: {
          orderBy: { startedAt: "desc" },
          take: 5,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Erreur lors de la récupération des jobs:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Créer un nouveau job avec des valeurs par défaut
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Créer ou récupérer une équipe par défaut pour l'utilisateur
    let team = await prisma.team.findFirst({
      where: {
        createdById: user.id,
      },
    });

    if (!team) {
      team = await prisma.team.create({
        data: {
          name: `${user.name || user.email}'s Team`,
          slug: `team-${user.id}`,
          createdById: user.id,
        },
      });
    }

    // Récupérer les données du formulaire si envoyées
    const body = await request.json().catch(() => ({}));

    // Validation : la catégorie est obligatoire pour une sauvegarde définitive
    // Mais on permet la création d'un job "brouillon" sans catégorie
    const isDraft = !body || !body.category || !body.category.trim();

    if (isDraft) {
      console.log("Création d'un job brouillon sans catégorie");
    }

    // Vérifier que la catégorie existe et appartient à l'équipe
    if (body && body.category) {
      const category = await prisma.jobCategory.findFirst({
        where: {
          id: body.category,
          teamId: team.id,
        },
      });

      if (!category) {
        return NextResponse.json({ error: "Catégorie invalide" }, { status: 400 });
      }
    }

    let jobData;

    if (isDraft) {
      // Créer un job brouillon avec des valeurs par défaut
      jobData = {
        teamId: team.id,
        name: "Nouveau job",
        description: "Job en cours de création",
        status: "DISABLED",
        categoryId: null, // Pas de catégorie pour l'instant

        // Valeurs par défaut pour les champs requis
        scheduleMode: "preset",
        schedulePreset: "daily",
        cronExpression: "1 0 * * *",
        timezone: "Europe/Brussels",
        allowedDays: [true, true, true, true, true, true, true],

        apiMethod: "GET",
        apiUrl: "https://api.example.com",
        apiAuth: { type: "none" },
        apiQueryParams: [],
        apiHeaders: [],
        apiBody: "",
        apiBodyType: "json",
        apiTimeout: 30000,
        apiFollowRedirects: true,
        apiSuccessCodes: [200],
        apiFailureCodes: [],

        notificationTrigger: "error",
        notificationHttpCodes: [],
        notificationRecipients: [session.user.email],
        notificationSubject: "{{job.name}} - {{run.state}}",
        notificationTemplate: "Job {{job.name}} finished with status {{run.state}}",
        notificationIncludeLogs: true,
        notificationIncludeResponse: false,
        notificationMinInterval: 15,
        notificationMaxPerDay: 10,
        notificationDailySummary: false,

        concurrency: "skip",
        timeout: 300000,
        retries: 3,
        backoffType: "exponential",
        backoffDelay: 1000,
        jitter: true,
        runOnDeploy: false,
        failSafeThreshold: 5,
      };
    } else {
      // Utiliser les données fournies pour un job complet
      const convertedData = formDataToJobUpdate(body);
      jobData = { ...convertedData, teamId: team.id };
    }

    const job = await prisma.job.create({
      data: jobData,
    });

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Erreur lors de la création du job:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
