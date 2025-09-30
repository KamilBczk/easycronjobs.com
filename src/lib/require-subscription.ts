import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserTeamWithAccess } from "./subscription";

/**
 * Middleware pour vérifier qu'un utilisateur a un abonnement valide
 * À utiliser dans les pages protégées
 */
export async function requireSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const teamAccess = await getUserTeamWithAccess(session.user.id);

  if (!teamAccess) {
    // Pas d'équipe du tout, rediriger vers une page de création d'équipe ou billing
    redirect("/app/billing");
  }

  return {
    userId: session.user.id,
    teamId: teamAccess.teamId,
    teamName: teamAccess.teamName,
  };
}