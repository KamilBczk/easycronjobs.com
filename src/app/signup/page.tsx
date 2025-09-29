"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      setSuccess(true);
    } catch (error) {
      setError("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(253,186,116,0.18),_transparent_60%)] px-6 py-16 text-neutral-800">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15),_transparent_60%)]"></div>
        <div className="relative w-full max-w-lg rounded-[36px] border border-amber-200/60 bg-white/90 p-10 shadow-2xl shadow-amber-200/40 backdrop-blur">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                ✅ Compte créé avec succès
              </span>
            </div>
            <h1 className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Vérifiez votre email !
            </h1>
            <p className="mt-3 text-neutral-600">
              Nous avons envoyé un lien de vérification à votre adresse email.
              Cliquez sur le lien pour activer votre compte.
            </p>
            <div className="mt-8 space-y-4">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40"
              >
                Aller à la connexion
              </Link>
              <p className="text-xs text-neutral-500">
                Vous n'avez pas reçu l'email ? Vérifiez vos spams ou
                <button
                  className="ml-1 font-semibold text-amber-600 transition hover:text-amber-700"
                  onClick={() => setSuccess(false)}
                >
                  réessayez
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.18),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(253,186,116,0.18),_transparent_60%)] px-6 py-16 text-neutral-800">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.15),_transparent_60%)]"></div>
      <div className="relative w-full max-w-lg rounded-[36px] border border-amber-200/60 bg-white/90 p-10 shadow-2xl shadow-amber-200/40 backdrop-blur">
        <div className="absolute -left-24 top-16 hidden h-32 w-32 rounded-full bg-amber-400/40 blur-3xl md:block"></div>
        <div className="absolute -right-20 -top-12 hidden h-28 w-28 rounded-full bg-amber-500/50 blur-3xl md:block"></div>
        <div className="space-y-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-700">
              🚀 Inscription Easy Cron Jobs
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Lancez vos cron jobs en moins de 5 min.
            </h1>
            <p className="mt-3 text-neutral-600">
              Créez votre compte et déployez vos premiers jobs dans le cloud
              avec une interface funky et fiable.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-neutral-700"
                  htmlFor="firstName"
                >
                  Prénom
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-neutral-700"
                  htmlFor="lastName"
                >
                  Nom
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-neutral-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john@startup.com"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-neutral-700"
                htmlFor="password"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
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
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={formData.terms}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-amber-600 focus:ring-amber-300"
              />
              <label className="text-sm text-neutral-600" htmlFor="terms">
                J'accepte les{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-amber-600 transition hover:text-amber-700"
                >
                  conditions d'utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-amber-600 transition hover:text-amber-700"
                >
                  politique de confidentialité
                </Link>
                .
              </label>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer rounded-2xl bg-amber-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40 disabled:opacity-50"
              >
                {isLoading ? "Création du compte..." : "🚀 Créer mon compte"}
              </button>
              <button
                type="button"
                className="w-full cursor-pointer rounded-2xl border border-amber-200 px-4 py-3 text-base font-semibold text-amber-600 transition hover:border-amber-300 hover:text-amber-700"
              >
                Continuer avec Google
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-4 text-center text-sm text-neutral-600">
            Vous avez déjà un compte ?
            <Link
              href="/login"
              className="ml-2 font-semibold text-amber-600 transition hover:text-amber-700"
            >
              Connectez-vous →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
