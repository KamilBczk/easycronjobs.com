import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Option risquée : lie automatiquement si e-mails identiques et vérifiés.
      // allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      // Pas affiché côté UI avec App Router; tu gères ton formulaire
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Option: n'autoriser que les emails vérifiés
        // if (!user.emailVerified) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.userId) (session as any).user.id = token.userId;
      return session;
    },
    async signIn({ account, profile, user }) {
      // Exemple: créer une équipe par défaut au 1er login
      if (account && user) {
        const count = await prisma.teamMember.count({
          where: { userId: user.id },
        });
        if (count === 0) {
          const team = await prisma.team.create({
            data: {
              name: "My Team",
              slug: `team_${user.id.slice(0, 8)}`,
              createdById: user.id,
              members: { create: { userId: user.id, role: "OWNER" } },
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});
