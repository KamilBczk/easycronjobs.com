import { requireSubscription } from "@/lib/require-subscription";
import { checkTeamSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface RequireSubscriptionWrapperProps {
  children: ReactNode;
  showWarning?: boolean;
}

export async function RequireSubscriptionWrapper({
  children,
  showWarning = false,
}: RequireSubscriptionWrapperProps) {
  const { teamId } = await requireSubscription();

  // Vérifier si l'abonnement est valide
  const subscription = await checkTeamSubscription(teamId);

  if (!subscription.isValid) {
    redirect("/app/billing");
  }

  return (
    <>
      {showWarning && subscription.isCanceled && subscription.daysRemaining && (
        <div className="border-b border-orange-200 bg-orange-50 px-6 py-3">
          <p className="text-sm text-orange-900">
            ⚠️ Votre abonnement a été annulé. Il reste{" "}
            <span className="font-semibold">{subscription.daysRemaining} jours</span>{" "}
            avant l'expiration.
          </p>
        </div>
      )}
      {children}
    </>
  );
}