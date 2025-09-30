import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-4xl py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les paramètres de votre compte
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Préférences générales</CardTitle>
            <CardDescription>
              Configurez vos préférences d'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Langue</label>
              <p className="text-sm text-muted-foreground">Français</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fuseau horaire</label>
              <p className="text-sm text-muted-foreground">UTC (Europe/Paris)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Gérez vos préférences de notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notifications par email</label>
              <p className="text-sm text-muted-foreground">
                Recevoir des notifications pour les tâches importantes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              La suppression de compte sera disponible prochainement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}