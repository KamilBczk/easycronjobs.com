import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserTeamWithAccess, checkTeamSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";
import { ReactNode } from "react";

interface SubscriptionGuardProps {
  userId: string;
  children: ReactNode;
}

export async function SubscriptionGuard({ userId, children }: SubscriptionGuardProps) {
  // Récupérer le pathname actuel
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Pages qui ne nécessitent pas d'abonnement valide
  const allowedWithoutSubscription = [
    "/app/billing",
    "/app/profile",
    "/app/settings",
  ];

  const isAllowedPage = allowedWithoutSubscription.some((path) =>
    pathname.startsWith(path)
  );

  // Si la page est autorisée sans abonnement, laisser passer
  if (isAllowedPage) {
    return <>{children}</>;
  }

  // Vérifier si l'utilisateur est admin (les admins ont toujours accès)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (user?.isAdmin) {
    return <>{children}</>;
  }

  // Pour les utilisateurs normaux, vérifier l'abonnement
  const teamAccess = await getUserTeamWithAccess(userId);

  if (!teamAccess) {
    // Pas d'équipe, rediriger vers billing
    redirect("/app/billing");
  }

  const subscription = await checkTeamSubscription(teamAccess.teamId);

  if (!subscription.isValid) {
    // Abonnement invalide, rediriger vers billing
    redirect("/app/billing");
  }

  // Afficher un avertissement si l'abonnement est annulé mais encore actif
  if (subscription.isCanceled && subscription.daysRemaining) {
    return (
      <>
        <div className="border-b border-orange-200 bg-orange-50 px-6 py-3">
          <p className="text-sm text-orange-900">
            ⚠️ Votre abonnement a été annulé. Il reste{" "}
            <span className="font-semibold">{subscription.daysRemaining} jours</span>{" "}
            avant l'expiration. <a href="/app/billing" className="underline font-semibold">Réactiver</a>
          </p>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
}