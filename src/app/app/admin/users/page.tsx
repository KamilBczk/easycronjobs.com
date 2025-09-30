import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Vérifier si l'utilisateur est admin
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!currentUser?.isAdmin) {
    redirect("/app");
  }

  // Récupérer tous les utilisateurs avec leurs équipes et abonnements
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      isAdmin: true,
      teamMembers: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
              subscriptionStatus: true,
              stripePriceId: true,
              trialEndsAt: true,
              stripeCurrentPeriodEnd: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          Aucun
        </span>
      );
    }
    if (status === "trialing") {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          Essai
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
          Actif
        </span>
      );
    }
    if (status === "canceled") {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
          Annulé
        </span>
      );
    }
    if (status === "past_due") {
      return (
        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
          Impayé
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
        {status}
      </span>
    );
  };

  const getPlanName = (priceId: string | null) => {
    if (!priceId) return "-";
    if (priceId.includes(process.env.STRIPE_STARTER_PRICE_ID || "starter")) {
      return "Starter ($10)";
    }
    if (priceId.includes(process.env.STRIPE_PRO_PRICE_ID || "pro")) {
      return "Pro ($25)";
    }
    return "Plan personnalisé";
  };

  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-7xl py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de tous les utilisateurs et leurs abonnements
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Utilisateurs ({users.length})
            </CardTitle>
            <CardDescription>
              Liste complète des utilisateurs avec leurs équipes et statuts d'abonnement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Équipe(s)</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Fin essai/période</TableHead>
                    <TableHead>Inscrit le</TableHead>
                    <TableHead>Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const mainTeam = user.teamMembers[0]?.team;
                    const hasMultipleTeams = user.teamMembers.length > 1;

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "Sans nom"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {mainTeam ? (
                            <div>
                              <p className="text-sm font-medium">{mainTeam.name}</p>
                              {hasMultipleTeams && (
                                <p className="text-xs text-muted-foreground">
                                  +{user.teamMembers.length - 1} autre(s)
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Aucune équipe
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(mainTeam?.subscriptionStatus || null)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {getPlanName(mainTeam?.stripePriceId || null)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {mainTeam?.trialEndsAt
                            ? formatDate(mainTeam.trialEndsAt)
                            : mainTeam?.stripeCurrentPeriodEnd
                            ? formatDate(mainTeam.stripeCurrentPeriodEnd)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          {user.isAdmin ? (
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                              Admin
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun utilisateur trouvé
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Abonnements actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  users.filter((u) =>
                    u.teamMembers.some(
                      (tm) =>
                        tm.team.subscriptionStatus === "active" ||
                        tm.team.subscriptionStatus === "trialing"
                    )
                  ).length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Sans abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  users.filter(
                    (u) =>
                      u.teamMembers.length === 0 ||
                      u.teamMembers.every((tm) => !tm.team.subscriptionStatus)
                  ).length
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}