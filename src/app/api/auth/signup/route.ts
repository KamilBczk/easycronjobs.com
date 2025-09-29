export const runtime = "nodejs";

import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const signupSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
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
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password } = parsed.data;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 },
      );
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        email,
        passwordHash,
      },
    });

    // Créer une équipe par défaut
    await prisma.team.create({
      data: {
        name: "My Team",
        slug: `team_${user.id.slice(0, 8)}`,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Créer un token de vérification
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Envoyer l'email de vérification
    const emailResult = await sendVerificationEmail(email, token);

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
      // Ne pas faire échouer l'inscription pour autant
    }

    return NextResponse.json({
      message: "Compte créé avec succès. Vérifiez votre email pour l'activer.",
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
