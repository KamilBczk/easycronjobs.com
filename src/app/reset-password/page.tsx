"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          Token manquant
        </h2>
        <p className="text-neutral-600 mb-6">
          Le lien de réinitialisation est invalide.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-amber-600"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de la réinitialisation");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?success=Mot de passe mis à jour");
      }, 2000);
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">
          ✅ Mot de passe mis à jour
        </h2>
        <p className="text-neutral-600 mb-6">
          Vous allez être redirigé vers la page de connexion...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
          🔑 Nouveau mot de passe
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-neutral-900 sm:text-4xl">
          Choisissez votre nouveau mot de passe
        </h1>
        <p className="mt-3 text-neutral-600">
          Entrez un mot de passe sécurisé pour votre compte Easy Cron Jobs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="password"
          >
            Nouveau mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <p className="text-xs text-neutral-500">
            Au moins 8 caractères avec une majuscule et un chiffre.
          </p>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="confirmPassword"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer rounded-2xl bg-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40 disabled:opacity-50"
        >
          {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
        </button>
      </form>

      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4 text-center text-sm text-neutral-600">
        Vous vous souvenez de votre mot de passe ?
        <Link
          href="/login"
          className="ml-2 font-semibold text-amber-600 transition hover:text-amber-700"
        >
          Connectez-vous →
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(253,186,116,0.18),_transparent_60%)] px-6 py-16 text-neutral-800">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15),_transparent_60%)]"></div>
      <div className="relative w-full max-w-lg rounded-[36px] border border-amber-200/60 bg-white/90 p-10 shadow-2xl shadow-amber-200/40 backdrop-blur">
        <div className="absolute -left-24 top-16 hidden h-32 w-32 rounded-full bg-amber-400/40 blur-3xl md:block"></div>
        <div className="absolute -right-20 -top-12 hidden h-28 w-28 rounded-full bg-amber-500/50 blur-3xl md:block"></div>
        <div className="space-y-8">
          <Suspense fallback={<div>Chargement...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
