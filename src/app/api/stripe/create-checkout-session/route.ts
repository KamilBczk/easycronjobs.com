import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe, STRIPE_PLANS, type PlanType } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { teamId, planId } = body;

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    if (!planId || !(planId in STRIPE_PLANS)) {
      return NextResponse.json(
        { error: "Valid plan ID is required" },
        { status: 400 }
      );
    }

    const selectedPlan = STRIPE_PLANS[planId as PlanType];

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

    // Créer ou récupérer le customer Stripe
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

    // Créer la session de checkout avec essai de 14 jours
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXTAUTH_URL}/app/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/app/billing?canceled=true`,
      subscription_data: {
        trial_period_days: selectedPlan.trialDays,
        metadata: {
          teamId: teamId,
        },
      },
      metadata: {
        teamId: teamId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}