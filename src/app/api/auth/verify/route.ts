export const runtime = "nodejs";

import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/login?error=Token manquant", request.url),
      );
    }

    // Chercher le token de vérification
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/login?error=Token invalide", request.url),
      );
    }

    // Vérifier l'expiration
    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(
        new URL("/login?error=Token expiré", request.url),
      );
    }

    // Marquer l'email comme vérifié
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Supprimer le token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(
      new URL("/login?success=Email vérifié avec succès", request.url),
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(
      new URL("/login?error=Erreur de vérification", request.url),
    );
  }
}
