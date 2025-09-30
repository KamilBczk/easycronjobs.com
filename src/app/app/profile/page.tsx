import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const initials = session.user.name
    ?.split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <div className="h-full overflow-auto">
      <div className="container max-w-4xl py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos informations personnelles
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>
              Vos informations de profil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-amber-500 text-white text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{session.user.name}</h3>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nom complet
                </label>
                <p className="mt-1 text-base">{session.user.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="mt-1 text-base">{session.user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID Utilisateur
                </label>
                <p className="mt-1 text-base font-mono text-sm">{session.user.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}