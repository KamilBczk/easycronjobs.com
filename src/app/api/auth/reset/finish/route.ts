export const runtime = "nodejs";

import bcrypt from "bcrypt";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const resetFinishSchema = z
  .object({
    token: z.string().min(1, "Token requis"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetFinishSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    // Chercher le token de réinitialisation
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 },
      );
    }

    // Vérifier l'expiration
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json({ error: "Token expiré" }, { status: 400 });
    }

    // Hasher le nouveau mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { passwordHash },
    });

    // Supprimer le token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    console.error("Password reset finish error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
