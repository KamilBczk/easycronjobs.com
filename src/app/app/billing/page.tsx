import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubscriptionManager } from "@/components/subscription-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Récupérer la première équipe de l'utilisateur
  const teamMember = await prisma.teamMember.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ["OWNER", "ADMIN"] },
    },
    include: {
      team: true,
    },
  });

  if (!teamMember) {
    return (
      <div className="h-full overflow-auto">
        <div className="container max-w-4xl py-6 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Billing</h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre abonnement et facturation
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aucune équipe trouvée</CardTitle>
              <CardDescription>
                Vous devez être propriétaire ou administrateur d'une équipe pour gérer la facturation.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-4xl py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Billing</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre abonnement et facturation pour <span className="font-semibold">{teamMember.team.name}</span>
          </p>
        </div>

        <SubscriptionManager
          teamId={teamMember.team.id}
          subscriptionStatus={teamMember.team.subscriptionStatus}
          trialEndsAt={teamMember.team.trialEndsAt}
          stripeCurrentPeriodEnd={teamMember.team.stripeCurrentPeriodEnd}
          stripePriceId={teamMember.team.stripePriceId}
        />

        <Card>
          <CardHeader>
            <CardTitle>Historique de facturation</CardTitle>
            <CardDescription>
              Consultez vos factures passées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Toutes vos factures sont accessibles via le portail Stripe en cliquant sur "Gérer la facturation".
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}