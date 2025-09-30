import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getUserTeamWithAccess, checkTeamSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/prisma";

export default async function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Récupérer le pathname depuis les headers
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || headersList.get("x-pathname") || "";

  // Pages autorisées sans vérification d'abonnement
  const allowedPaths = ["/app/billing", "/app/profile", "/app/settings"];
  const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));

  if (isAllowed) {
    return <>{children}</>;
  }

  // Vérifier si admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (user?.isAdmin) {
    return <>{children}</>;
  }

  // Vérifier l'abonnement
  const teamAccess = await getUserTeamWithAccess(session.user.id);

  if (!teamAccess) {
    redirect("/app/billing");
  }

  const subscription = await checkTeamSubscription(teamAccess.teamId);

  if (!subscription.isValid) {
    redirect("/app/billing");
  }

  // Afficher un avertissement si annulé mais actif
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