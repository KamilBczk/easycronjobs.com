"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/app");
      }
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/app" });
  };

  return (
    <>
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
          🔐 Connexion Easy Cron Jobs
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-neutral-900 sm:text-4xl">
          Reprenez vos cron jobs avec style.
        </h1>
        <p className="mt-3 text-neutral-600">
          Connectez-vous pour suivre vos exécutions, gérer vos alertes et
          piloter vos jobs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {(error || errorMessage) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error || errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center text-sm text-green-600">
            {successMessage}
          </div>
        )}

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-neutral-700">
            <label htmlFor="password">Mot de passe</label>
            <Link
              href="/forgot-password"
              className="text-amber-600 transition hover:text-amber-700"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <div className="space-y-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full cursor-pointer rounded-2xl bg-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40 disabled:opacity-50"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer rounded-2xl border border-amber-200 px-4 py-3 text-base font-semibold text-amber-600 transition hover:border-amber-300 hover:text-amber-700"
          >
            Continuer avec Google
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4 text-center text-sm text-neutral-600">
        Pas encore de compte ?
        <Link
          href="/signup"
          className="ml-2 font-semibold text-amber-600 transition hover:text-amber-700"
        >
          Créez votre accès funky →
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(253,186,116,0.18),_transparent_60%)] px-6 py-16 text-neutral-800">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15),_transparent_60%)]"></div>
      <div className="relative w-full max-w-lg rounded-[36px] border border-amber-200/60 bg-white/90 p-10 shadow-2xl shadow-amber-200/40 backdrop-blur">
        <div className="absolute -left-24 top-16 hidden h-32 w-32 rounded-full bg-amber-400/40 blur-3xl md:block"></div>
        <div className="absolute -right-20 -top-12 hidden h-28 w-28 rounded-full bg-amber-500/50 blur-3xl md:block"></div>
        <div className="space-y-8">
          <Suspense fallback={<div>Chargement...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
