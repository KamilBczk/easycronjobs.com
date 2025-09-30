import { prisma } from "@/lib/prisma";

export async function checkTeamSubscription(teamId: string): Promise<{
  isValid: boolean;
  status: string | null;
  isTrialing: boolean;
  isActive: boolean;
  isCanceled: boolean;
  daysRemaining: number | null;
  periodEnd: Date | null;
}> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      subscriptionStatus: true,
      trialEndsAt: true,
      stripeCurrentPeriodEnd: true,
      stripePriceId: true,
    },
  });

  if (!team) {
    return {
      isValid: false,
      status: null,
      isTrialing: false,
      isActive: false,
      isCanceled: false,
      daysRemaining: null,
      periodEnd: null,
    };
  }

  const now = new Date();
  const isTrialing = team.subscriptionStatus === "trialing";
  const isActive = team.subscriptionStatus === "active";
  const isCanceled = team.subscriptionStatus === "canceled";

  // Un abonnement annulé est encore valide jusqu'à la fin de la période
  const isCanceledButStillActive =
    isCanceled &&
    team.stripeCurrentPeriodEnd &&
    now < new Date(team.stripeCurrentPeriodEnd);

  let daysRemaining: number | null = null;
  let periodEnd: Date | null = null;

  if (isTrialing && team.trialEndsAt) {
    const trialEnd = new Date(team.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    periodEnd = trialEnd;
  } else if (team.stripeCurrentPeriodEnd) {
    const currentPeriodEnd = new Date(team.stripeCurrentPeriodEnd);
    const diffTime = currentPeriodEnd.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    periodEnd = currentPeriodEnd;
  }

  // L'abonnement est valide si :
  // 1. Il est en période d'essai et la date de fin n'est pas dépassée
  // 2. Il est actif
  // 3. Il est annulé mais la période actuelle n'est pas terminée
  const isValid =
    (isTrialing && team.trialEndsAt && now < new Date(team.trialEndsAt)) ||
    isActive ||
    Boolean(isCanceledButStillActive);

  return {
    isValid: Boolean(isValid),
    status: team.subscriptionStatus,
    isTrialing,
    isActive,
    isCanceled,
    daysRemaining,
    periodEnd,
  };
}

/**
 * Vérifie si l'utilisateur a accès à l'application
 * Retourne l'ID de la première équipe avec un abonnement valide
 */
export async function getUserTeamWithAccess(
  userId: string
): Promise<{ teamId: string; teamName: string } | null> {
  const teamMembers = await prisma.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        select: {
          id: true,
          name: true,
          subscriptionStatus: true,
          stripeCurrentPeriodEnd: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (teamMembers.length === 0) {
    return null;
  }

  // Chercher une équipe avec un abonnement valide
  for (const tm of teamMembers) {
    const subscription = await checkTeamSubscription(tm.team.id);
    if (subscription.isValid) {
      return {
        teamId: tm.team.id,
        teamName: tm.team.name,
      };
    }
  }

  // Retourner la première équipe même si pas d'abonnement
  // (pour pouvoir rediriger vers billing)
  return {
    teamId: teamMembers[0].team.id,
    teamName: teamMembers[0].team.name,
  };
}