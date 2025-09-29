export const runtime = "nodejs";

import { randomBytes } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendPasswordResetEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const resetStartSchema = z.object({
  email: z.string().email("Email invalide"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetStartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const { email } = parsed.data;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Toujours retourner succès pour éviter l'énumération d'emails
    if (!user) {
      return NextResponse.json({
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé.",
      });
    }

    // Supprimer les anciens tokens pour cet email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Créer un nouveau token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Envoyer l'email de reset
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      message: "Si cet email existe, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("Password reset start error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
