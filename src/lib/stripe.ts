import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});

export const STRIPE_PLANS = {
  STARTER: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "",
    name: "Starter",
    price: 10,
    currency: "usd",
    interval: "month",
    trialDays: 14,
    features: [
      "Jusqu'à 50 jobs",
      "Notifications email",
      "Historique 30 jours",
      "Support par email",
    ],
  },
  PRO: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    name: "Pro",
    price: 25,
    currency: "usd",
    interval: "month",
    trialDays: 14,
    features: [
      "Jobs illimités",
      "Notifications email",
      "Historique illimité",
      "Support prioritaire",
      "Webhooks personnalisés",
      "API avancée",
    ],
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;