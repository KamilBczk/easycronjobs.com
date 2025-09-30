import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est membre de l'équipe
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
      include: {
        team: true,
      },
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "You must be an owner or admin of this team" },
        { status: 403 }
      );
    }

    // Créer le customer Stripe s'il n'existe pas
    let customerId = teamMember.team.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email || undefined,
        metadata: {
          teamId: teamId,
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Mettre à jour l'équipe avec le customer ID
      await prisma.team.update({
        where: { id: teamId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Créer la session du portail client
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/app/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}