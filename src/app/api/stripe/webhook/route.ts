import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature found" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const teamId = session.metadata?.teamId;

        if (!teamId) {
          console.error("No teamId in session metadata");
          break;
        }

        // Récupérer la subscription
        const sub = (await stripe.subscriptions.retrieve(
          session.subscription as string
        )) as Stripe.Subscription;

        // Calculer la date de fin de trial
        const trialEnd = sub.trial_end
          ? new Date(sub.trial_end * 1000)
          : null;

        // Préparer les données de mise à jour
        const updateData: {
          stripeSubscriptionId: string;
          stripePriceId?: string;
          stripeCurrentPeriodEnd?: Date;
          subscriptionStatus: Stripe.Subscription.Status;
          trialEndsAt: Date | null;
        } = {
          stripeSubscriptionId: sub.id,
          subscriptionStatus: sub.status,
          trialEndsAt: trialEnd,
        };

        if (sub.items.data[0]?.price.id) {
          updateData.stripePriceId = sub.items.data[0].price.id;
        }

        const periodEnd = (sub as any).current_period_end;
        if (periodEnd) {
          updateData.stripeCurrentPeriodEnd = new Date(periodEnd * 1000);
        }

        // Mettre à jour l'équipe
        await prisma.team.update({
          where: { id: teamId },
          data: updateData,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const teamId = subscription.metadata?.teamId;

        console.log('[WEBHOOK] customer.subscription.updated');
        console.log('[WEBHOOK] Subscription ID:', subscription.id);
        console.log('[WEBHOOK] Customer ID:', subscription.customer);
        console.log('[WEBHOOK] Status:', subscription.status);
        console.log('[WEBHOOK] Cancel at period end:', subscription.cancel_at_period_end);
        console.log('[WEBHOOK] Team ID from metadata:', teamId);

        // Déterminer le vrai statut en tenant compte de cancel_at_period_end
        let status = subscription.status;
        if (subscription.cancel_at_period_end) {
          status = "canceled";
          console.log('[WEBHOOK] Status overridden to "canceled" due to cancel_at_period_end');
        }

        const updateData: {
          stripePriceId?: string;
          stripeCurrentPeriodEnd?: Date;
          subscriptionStatus: string;
        } = {
          subscriptionStatus: status,
        };

        if (subscription.items.data[0]?.price.id) {
          updateData.stripePriceId = subscription.items.data[0].price.id;
        }

        const subPeriodEnd = (subscription as any).current_period_end;
        if (subPeriodEnd) {
          updateData.stripeCurrentPeriodEnd = new Date(subPeriodEnd * 1000);
        }

        console.log('[WEBHOOK] Update data:', updateData);

        try {
          if (!teamId) {
            console.log('[WEBHOOK] No teamId in metadata, searching by customer ID');
            // Essayer de trouver l'équipe via le customer ID
            const team = await prisma.team.findUnique({
              where: { stripeCustomerId: subscription.customer as string },
            });

            if (team) {
              console.log('[WEBHOOK] Team found:', team.id, team.name);
              await prisma.team.update({
                where: { id: team.id },
                data: updateData,
              });
              console.log('[WEBHOOK] Team updated successfully');
            } else {
              console.log(`[WEBHOOK] Team not found for customer: ${subscription.customer}`);
            }
          } else {
            console.log('[WEBHOOK] Updating team with ID:', teamId);
            await prisma.team.update({
              where: { id: teamId },
              data: updateData,
            });
            console.log('[WEBHOOK] Team updated successfully');
          }
        } catch (err) {
          console.error('[WEBHOOK] Error updating team subscription:', err);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Trouver l'équipe via le subscription ID
        const team = await prisma.team.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (team) {
          await prisma.team.update({
            where: { id: team.id },
            data: {
              subscriptionStatus: "canceled",
              stripeCurrentPeriodEnd: new Date(
                (subscription as any).current_period_end * 1000
              ),
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = (invoice as any).subscription;

        if (subscription) {
          const sub = (await stripe.subscriptions.retrieve(
            subscription as string
          )) as Stripe.Subscription;
          const team = await prisma.team.findUnique({
            where: { stripeSubscriptionId: sub.id },
          });

          if (team) {
            await prisma.team.update({
              where: { id: team.id },
              data: {
                stripeCurrentPeriodEnd: new Date(
                  (sub as any).current_period_end * 1000
                ),
                subscriptionStatus: sub.status,
              },
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscription = (invoice as any).subscription;

        if (subscription) {
          const sub = (await stripe.subscriptions.retrieve(
            subscription as string
          )) as Stripe.Subscription;
          const team = await prisma.team.findUnique({
            where: { stripeSubscriptionId: sub.id },
          });

          if (team) {
            await prisma.team.update({
              where: { id: team.id },
              data: {
                subscriptionStatus: "past_due",
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}