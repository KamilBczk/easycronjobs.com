import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Récupérer l'utilisateur complet avec ses équipes
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teamMembers: {
        include: {
          team: true,
        },
      },
    },
  });

  return user;
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Non authentifié");
  }

  return session.user;
}
