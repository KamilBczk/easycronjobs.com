"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";
import { AlarmClock, BellRing, Cloud, Menu, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const features: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Exécution fiable",
    description:
      "Du cloud ultra stable, plus besoin de garder un serveur bricolé allumé.",
    icon: Cloud,
  },
  {
    title: "Ultra simple",
    description: "Une UI claire qui déploie vos cron jobs en quelques clics.",
    icon: Zap,
  },
  {
    title: "Notifications",
    description: "Recevez des alertes par email dès qu'un job échoue.",
    icon: BellRing,
  },
  {
    title: "Scalable",
    description: "Passez de 3 à 300 jobs sans changer d'infra.",
    icon: AlarmClock,
  },
];

const steps = [
  {
    title: "Créez un job",
    text: "Donnez un nom, collez votre commande et décrivez sa mission.",
  },
  {
    title: "Choisissez sa fréquence",
    text: "Un cron classique ou un preset express (5 min, horaire, quotidien).",
  },
  {
    title: "Recevez vos résultats",
    text: "Logs propres, alertes instantanées, et partage facile avec l'équipe.",
  },
];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from("[data-animate='hero']", {
        opacity: 0,
        y: 48,
        duration: 0.9,
        ease: "power3.out",
      });

      ScrollTrigger.batch("[data-animate='feature-card']", {
        start: "top 80%",
        batchMax: 3,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 36 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.12,
            }
          );
        },
      });

      ScrollTrigger.batch("[data-animate='step-card']", {
        start: "top 75%",
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.75,
              ease: "power2.out",
              stagger: 0.15,
            }
          );
        },
      });

      gsap.from("[data-animate='pricing']", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#pricing",
          start: "top 80%",
        },
      });

      gsap.from("[data-animate='cta-block']", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "#contact",
          start: "top 85%",
        },
      });
    }, pageRef);

    return () => {
      ctx.revert();
      ScrollTrigger.killAll(false);
    };
  }, []);

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.15),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(253,186,116,0.2),_transparent_55%)] text-neutral-800"
    >
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 animate-pulse bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.25),_transparent_55%)]"></div>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 sm:px-12">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span className="font-semibold text-amber-600">Easy Cron Jobs</span>
            <nav className="hidden items-center gap-8 md:flex">
              <a className="transition hover:text-amber-600" href="#features">
                Fonctionnalités
              </a>
              <a className="transition hover:text-amber-600" href="#demo">
                Demo
              </a>
              <a className="transition hover:text-amber-600" href="#pricing">
                Pricing
              </a>
              <a className="transition hover:text-amber-600" href="#contact">
                Contact
              </a>
              <Link
                className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:border-amber-300 hover:text-amber-700"
                href="/login"
              >
                Login
              </Link>
              <Link
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40"
                href="/signup"
              >
                Start Trial
              </Link>
            </nav>
            <div className="md:hidden">
              <button
                type="button"
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-amber-200 text-amber-600 shadow-sm transition hover:border-amber-300 hover:text-amber-700"
                aria-label="Ouvrir le menu"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          </div>
          <div
            className={`md:hidden transition-all duration-300 ${
              isMobileMenuOpen
                ? "max-h-[420px] opacity-100"
                : "pointer-events-none max-h-0 opacity-0"
            }`}
          >
            <div className="mt-6 space-y-4 rounded-3xl border border-amber-100 bg-white/90 p-6 text-sm text-neutral-700 shadow-lg shadow-amber-200/40">
              {[
                { label: "Fonctionnalités", href: "#features" },
                { label: "Demo", href: "#demo" },
                { label: "Pricing", href: "#pricing" },
                { label: "Contact", href: "#contact" },
              ].map(({ label, href }) => (
                <button
                  key={href}
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between text-left transition hover:text-amber-600"
                  onClick={() => {
                    const target = document.querySelector(href);
                    target?.scrollIntoView({ behavior: "smooth" });
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {label} <span>→</span>
                </button>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:border-amber-300 hover:text-amber-700"
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40"
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Trial
                </Link>
              </div>
            </div>
          </div>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
            <div className="space-y-6" data-animate="hero">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
                ⚡ Gestion funky de cron jobs
              </span>
              <h1 className="text-balance text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl">
                Planifiez vos cron jobs dans le cloud, sans prise de tête.
              </h1>
              <p className="max-w-xl text-lg text-neutral-600 sm:text-xl">
                Fiable, simple, et funky. Dites adieu aux serveurs bricolés et
                gagnez du temps. Une interface funky mais fiable, pour devs
                pressés.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40"
                  href="/signup"
                >
                  🚀 Start Free Trial
                </a>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 px-6 py-3 text-base font-semibold text-amber-600 transition hover:border-amber-300 hover:text-amber-700"
                  href="#pricing"
                >
                  See Pricing
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  99.9% uptime garanti
                </div>
                <span>Support inclus • Alertes instantanées</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 -z-10 animate-[spin_12s_linear_infinite] rounded-[36px] bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 blur-3xl opacity-30"></div>
              <div className="rounded-[32px] border border-amber-200/60 bg-white/95 p-8 shadow-xl shadow-amber-200/40 backdrop-blur">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
                    Magic Cron Runner
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    Live
                  </span>
                </div>
                <div className="space-y-4 text-sm text-neutral-700">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-4">
                    <p className="font-semibold text-neutral-900">
                      cron deploy-prisma
                    </p>
                    <p className="text-xs uppercase tracking-wide text-amber-600">
                      0 */6 * * *
                    </p>
                    <p className="mt-2 text-sm text-neutral-600">
                      ✅ Dernière exécution réussie il y a 4 min
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                    <p className="font-semibold text-neutral-900">
                      cron backup-staging
                    </p>
                    <p className="text-xs uppercase tracking-wide text-amber-600">
                      15 3 * * *
                    </p>
                    <p className="mt-2 text-sm text-neutral-600">
                      ⚠️ Échec hier • Notification envoyée à l'équipe
                    </p>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Jobs actifs</span>
                    <span className="font-semibold text-neutral-900">24</span>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>Alertes envoyées</span>
                    <span className="font-semibold text-neutral-900">
                      6 / 100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-white">
        <section
          id="features"
          className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-24 sm:px-12 lg:grid-cols-2"
        >
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
              Pourquoi Easy Cron Jobs ?
            </span>
            <h2 className="text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Plus besoin de serveurs bricolés : vos cron jobs tournent pendant
              que vous dormez.
            </h2>
            <p className="text-lg text-neutral-600">
              On gère l'exécution, la surveillance et les alertes. Vous focus
              sur le produit.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg"
                data-animate="feature-card"
              >
                <div
                  className="absolute inset-0 -z-10 opacity-0 blur-2xl transition group-hover:opacity-100 group-hover:blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle at top, rgba(245, 158, 11, 0.15), transparent 55%)",
                  }}
                ></div>
                <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 p-3 text-amber-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                  {title}
                </h3>
                <p className="text-sm text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="demo"
          className="relative overflow-hidden bg-neutral-950 text-white"
        >
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.3),_transparent_60%)]"></div>
          <div className="mx-auto max-w-6xl px-6 py-24 sm:px-12">
            <div className="mb-12 space-y-4 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-amber-200">
                🚀 3 étapes chrono
              </span>
              <h2 className="text-balance text-3xl font-semibold sm:text-4xl">
                Comment Easy Cron Jobs fonctionne
              </h2>
              <p className="text-neutral-300">
                Configurez vos cron jobs sans prise de tête : une interface
                funky, des résultats fiables.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
                  data-animate="step-card"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/80 text-lg font-semibold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm text-neutral-200">{step.text}</p>
                  <div className="absolute -right-8 top-12 h-24 w-24 rounded-full bg-amber-500/30 blur-3xl transition group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-12"
        >
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
              💸 Pricing sans embrouille
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Choisissez le plan qui booste vos cron jobs
            </h2>
            <p className="mt-3 text-neutral-600">
              Passez en Pro quand vos jobs ont besoin de plus de punch.
            </p>
          </div>
          <div
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl"
            data-animate="pricing"
          >
            <table className="w-full table-fixed text-left text-sm sm:text-base">
              <thead className="bg-neutral-50 text-neutral-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Starter</th>
                  <th className="px-6 py-4 font-medium text-amber-600">
                    <div className="flex items-center gap-3">
                      Pro
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Most Popular
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                <tr className="bg-white">
                  <td className="px-6 py-5 text-neutral-500">Prix</td>
                  <td className="px-6 py-5 font-semibold text-neutral-900">
                    10 € / mois
                  </td>
                  <td className="px-6 py-5 font-semibold text-amber-600">
                    25 € / mois
                  </td>
                </tr>
                <tr className="bg-neutral-50/60">
                  <td className="px-6 py-5 text-neutral-500">Fréquence min.</td>
                  <td className="px-6 py-5 text-neutral-900">5 min</td>
                  <td className="px-6 py-5 text-neutral-900">30 sec</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-5 text-neutral-500">
                    Notifications email
                  </td>
                  <td className="px-6 py-5 text-neutral-900">100 / mois</td>
                  <td className="px-6 py-5 text-neutral-900">1 000 / mois</td>
                </tr>
                <tr className="bg-neutral-50/60">
                  <td className="px-6 py-5 text-neutral-500">
                    Logs sauvegardés
                  </td>
                  <td className="px-6 py-5 text-neutral-900">7 jours</td>
                  <td className="px-6 py-5 text-neutral-900">30 jours</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-5 text-neutral-500">Support</td>
                  <td className="px-6 py-5 text-neutral-900">Community</td>
                  <td className="px-6 py-5 text-neutral-900">Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto w-full max-w-4xl px-6 pb-24 sm:px-12"
        >
          <div
            className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-amber-50/80 px-8 py-16 text-center shadow-lg shadow-amber-200/40"
            data-animate="cta-block"
          >
            <div className="absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-amber-400/40 blur-3xl"></div>
            <h2 className="text-balance text-3xl font-semibold text-neutral-900">
              Prêt à lancer vos cron jobs dans le cloud ?
            </h2>
            <p className="mt-4 text-neutral-600">
              Testez Easy Cron Jobs gratuitement et envoyez vos premiers jobs en
              moins de 5 minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40"
                href="/signup"
              >
                Start Free Trial
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-500 px-6 py-3 text-base font-semibold text-amber-600 transition hover:border-amber-600 hover:text-amber-700"
                href="mailto:hello@easycronjobs.com"
              >
                Contact
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold text-neutral-900">
              Easy Cron Jobs
            </span>
            <span className="text-neutral-500">
              © {new Date().getFullYear()} Easy Cron Jobs
            </span>
          </div>
          <nav className="flex flex-wrap gap-6 text-neutral-600">
            <a className="transition hover:text-amber-600" href="#pricing">
              Pricing
            </a>
            <a
              className="transition hover:text-amber-600"
              href="https://docs.easycronjobs.com"
            >
              Docs
            </a>
            <a
              className="transition hover:text-amber-600"
              href="mailto:hello@easycronjobs.com"
            >
              Contact
            </a>
            <a className="transition hover:text-amber-600" href="/legal">
              Legal
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
