"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionManagerProps {
  teamId: string;
  subscriptionStatus?: string | null;
  trialEndsAt?: Date | null;
  stripeCurrentPeriodEnd?: Date | null;
  stripePriceId?: string | null;
}

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    price: 10,
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
    features: [
      "Jusqu'à 50 jobs",
      "Notifications email",
      "Historique 30 jours",
      "Support par email",
    ],
    recommended: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: 25,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    features: [
      "Jobs illimités",
      "Notifications email",
      "Historique illimité",
      "Support prioritaire",
      "Webhooks personnalisés",
      "API avancée",
    ],
    recommended: true,
  },
] as const;

export function SubscriptionManager({
  teamId,
  subscriptionStatus,
  trialEndsAt,
  stripeCurrentPeriodEnd,
  stripePriceId,
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setSelectedPlan(planId);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, planId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const isCanceled = subscriptionStatus === "canceled";
  const isPastDue = subscriptionStatus === "past_due";

  // Un abonnement annulé mais avec une date de fin dans le futur est encore utilisable
  const isCanceledButStillActive =
    isCanceled &&
    stripeCurrentPeriodEnd &&
    new Date(stripeCurrentPeriodEnd) > new Date();

  const hasNoSubscription =
    !subscriptionStatus ||
    (!stripePriceId && !isCanceledButStillActive);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    if (subscriptionStatus === "trialing") {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          Essai gratuit
        </span>
      );
    }
    if (subscriptionStatus === "active") {
      return (
        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          Actif
        </span>
      );
    }
    if (subscriptionStatus === "past_due") {
      return (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
          Paiement en retard
        </span>
      );
    }
    if (subscriptionStatus === "canceled") {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
          Annulé
        </span>
      );
    }
    return null;
  };

  const currentPlan = PLANS.find((p) => p.priceId === stripePriceId);

  return (
    <>
      {hasNoSubscription && !isCanceledButStillActive ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Choisissez votre plan</h2>
            <p className="text-muted-foreground">
              14 jours d'essai gratuit, sans carte de crédit requise
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative",
                  plan.recommended && "border-amber-500 shadow-lg"
                )}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Recommandé
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground"> / mois</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    className={cn(
                      "w-full",
                      plan.recommended && "bg-amber-500 hover:bg-amber-600"
                    )}
                  >
                    {loading && selectedPlan === plan.id
                      ? "Chargement..."
                      : "Commencer l'essai gratuit"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Abonnement
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              Gérez votre abonnement et vos informations de facturation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPlan && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Plan {currentPlan.name}</h3>
                  <span className="text-2xl font-bold">
                    ${currentPlan.price} / mois
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isCanceledButStillActive
                    ? "Plan annulé (actif jusqu'à la fin)"
                    : "Plan actuel"}
                </p>
              </div>
            )}

            {isCanceledButStillActive && stripeCurrentPeriodEnd && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm text-orange-900">
                  Votre abonnement a été annulé. Vous pouvez continuer à utiliser
                  le service jusqu'au{" "}
                  <span className="font-semibold">
                    {formatDate(stripeCurrentPeriodEnd)}
                  </span>
                  . Après cette date, vous devrez choisir un nouveau plan pour
                  continuer.
                </p>
              </div>
            )}

            {subscriptionStatus === "trialing" && trialEndsAt && !isCanceled && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  Votre essai gratuit se termine le{" "}
                  <span className="font-semibold">{formatDate(trialEndsAt)}</span>
                  . Vous ne serez facturé qu'à la fin de la période d'essai.
                </p>
              </div>
            )}

            {isPastDue && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-900">
                  Votre paiement a échoué. Veuillez mettre à jour vos informations
                  de paiement pour continuer à utiliser le service.
                </p>
              </div>
            )}

            {hasActiveSubscription && stripeCurrentPeriodEnd && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  {subscriptionStatus === "trialing"
                    ? "Période d'essai se termine le"
                    : "Prochaine facturation le"}{" "}
                  <span className="font-semibold text-foreground">
                    {formatDate(stripeCurrentPeriodEnd)}
                  </span>
                </p>
              </div>
            )}


            <Button
              onClick={handleManageBilling}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Chargement..." : "Gérer la facturation"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Vous serez redirigé vers le portail Stripe pour gérer votre
              abonnement, mettre à jour vos informations de paiement ou annuler.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}