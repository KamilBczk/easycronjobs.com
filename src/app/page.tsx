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
    title: "Infrastructure cloud robuste",
    description:
      "99.9% d'uptime garanti avec notre infrastructure redondante. Vos jobs s'exécutent même si votre serveur local tombe en panne.",
    icon: Cloud,
  },
  {
    title: "Configuration en 30 secondes",
    description: "Copiez-collez votre commande, définissez la fréquence, c'est fait. Plus simple qu'un crontab traditionnel.",
    icon: Zap,
  },
  {
    title: "Alertes intelligentes",
    description: "Email instantané en cas d'échec avec logs détaillés. Ne ratez plus jamais un problème critique.",
    icon: BellRing,
  },
  {
    title: "Croissance sans limite",
    description: "De 1 à 1000+ jobs, l'infrastructure s'adapte automatiquement. Pas de configuration serveur à gérer.",
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
              <Link className="transition hover:text-amber-600" href="/blog">
                Blog
              </Link>
              <a className="transition hover:text-amber-600" href="#faq">
                FAQ
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
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "#faq" },
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
                ⚡ Plateforme cloud de cron jobs
              </span>
              <h1 className="text-balance text-4xl font-bold text-neutral-900 sm:text-5xl lg:text-6xl">
                Automatisez vos tâches récurrentes en 2 minutes chrono
              </h1>
              <p className="max-w-xl text-lg text-neutral-600 sm:text-xl">
                Planifiez, exécutez et surveillez vos cron jobs dans le cloud.
                Interface intuitive, infrastructure ultra-fiable, alertes en temps réel.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40"
                  href="/signup"
                >
                  Essai gratuit 14 jours
                </a>
                <a
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 px-6 py-3 text-base font-semibold text-amber-600 transition hover:border-amber-300 hover:text-amber-700"
                  href="#demo"
                >
                  Voir la démo
                </a>
              </div>
              <div className="flex flex-col gap-3 text-sm text-neutral-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    99.9% uptime garanti
                  </div>
                  <span>•</span>
                  <span>Sans carte bancaire</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500">Utilisé par</span>
                  <span className="font-semibold text-neutral-900">500+ développeurs</span>
                  <span className="text-neutral-500">pour automatiser</span>
                  <span className="font-semibold text-neutral-900">12 000+ jobs</span>
                </div>
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
              Concentrez-vous sur votre produit, pas sur l'infrastructure
            </h2>
            <p className="text-lg text-neutral-600">
              Une plateforme complète qui gère l'exécution, la surveillance et les alertes de vos tâches automatisées.
              Économisez des heures de configuration et dormez sur vos deux oreilles.
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

        <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-12">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
              ⭐ Témoignages
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Ce que disent nos utilisateurs
            </h2>
            <p className="mt-3 text-neutral-600">
              Plus de 500 développeurs nous font confiance au quotidien
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-center gap-1 text-amber-500">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="mb-4 text-neutral-700">
                "Fini les serveurs qui tombent en panne la nuit. Easy Cron Jobs gère tout, je dors enfin tranquille !"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700">
                  TM
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Thomas Martin</p>
                  <p className="text-xs text-neutral-500">Lead Dev @StartupXYZ</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-center gap-1 text-amber-500">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="mb-4 text-neutral-700">
                "Configuration en 2 minutes chrono. L'interface est tellement intuitive que toute l'équipe peut créer des jobs."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700">
                  SD
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Sophie Dubois</p>
                  <p className="text-xs text-neutral-500">CTO @TechCorp</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 flex items-center gap-1 text-amber-500">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
              <p className="mb-4 text-neutral-700">
                "Les alertes instantanées m'ont sauvé plusieurs fois. Je détecte les problèmes avant même que mes clients s'en rendent compte."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-semibold text-amber-700">
                  AL
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">Alexandre Leroy</p>
                  <p className="text-xs text-neutral-500">Freelance Developer</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 py-24">
          <div className="mx-auto w-full max-w-6xl px-6 sm:px-12">
            <div className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
                📋 Cas d'usage
              </span>
              <h2 className="mt-4 text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
                Des automatisations pour tous vos besoins
              </h2>
              <p className="mt-3 text-neutral-600">
                Quelques exemples de tâches que nos clients automatisent
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 text-2xl">🗄️</div>
                <h3 className="mb-2 font-semibold text-neutral-900">Backups automatiques</h3>
                <p className="text-sm text-neutral-600">
                  Sauvegardez vos bases de données, fichiers et configurations toutes les nuits sans y penser.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 text-2xl">📊</div>
                <h3 className="mb-2 font-semibold text-neutral-900">Rapports quotidiens</h3>
                <p className="text-sm text-neutral-600">
                  Générez et envoyez des rapports d'analyse, KPIs ou métriques business chaque matin.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 text-2xl">🧹</div>
                <h3 className="mb-2 font-semibold text-neutral-900">Nettoyage de données</h3>
                <p className="text-sm text-neutral-600">
                  Supprimez les fichiers temporaires, logs anciens et données obsolètes automatiquement.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 text-2xl">📧</div>
                <h3 className="mb-2 font-semibold text-neutral-900">Emails programmés</h3>
                <p className="text-sm text-neutral-600">
                  Newsletters, notifications, rappels... envoyez vos emails au bon moment.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 text-2xl">🔄</div>
                <h3 className="mb-2 font-semibold text-neutral-900">Synchronisation de données</h3>
                <p className="text-sm text-neutral-600">
                  Synchronisez vos données entre différentes plateformes, APIs ou systèmes.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 text-2xl">🔍</div>
                <h3 className="mb-2 font-semibold text-neutral-900">Monitoring & Health checks</h3>
                <p className="text-sm text-neutral-600">
                  Vérifiez la santé de vos services et recevez des alertes en cas de problème.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-12">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
              🔌 Intégrations
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Compatible avec vos outils préférés
            </h2>
            <p className="mt-3 text-neutral-600">
              Exécutez n'importe quelle commande, script ou API call
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-white p-8">
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Langages & Runtimes</h3>
              <div className="grid grid-cols-3 gap-4">
                {["Node.js", "Python", "PHP", "Ruby", "Go", "Shell"].map((tech) => (
                  <div key={tech} className="flex items-center gap-2 text-sm text-neutral-700">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-8">
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Bases de données</h3>
              <div className="grid grid-cols-3 gap-4">
                {["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "MariaDB"].map((db) => (
                  <div key={db} className="flex items-center gap-2 text-sm text-neutral-700">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    {db}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-8">
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Services Cloud</h3>
              <div className="grid grid-cols-3 gap-4">
                {["AWS", "GCP", "Azure", "Vercel", "Netlify", "Heroku"].map((cloud) => (
                  <div key={cloud} className="flex items-center gap-2 text-sm text-neutral-700">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    {cloud}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-white p-8">
              <h3 className="mb-4 text-xl font-semibold text-neutral-900">Notifications</h3>
              <div className="grid grid-cols-3 gap-4">
                {["Email", "Slack", "Discord", "Webhook", "SMS", "Telegram"].map((notif) => (
                  <div key={notif} className="flex items-center gap-2 text-sm text-neutral-700">
                    <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    {notif}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-white to-neutral-50 py-24">
          <div className="mx-auto w-full max-w-5xl px-6 sm:px-12">
            <div className="mb-12 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
                ⚖️ Comparaison
              </span>
              <h2 className="mt-4 text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
                Pourquoi choisir Easy Cron Jobs ?
              </h2>
              <p className="mt-3 text-neutral-600">
                Découvrez ce qui nous différencie
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 font-medium text-neutral-500">Fonctionnalité</th>
                    <th className="px-6 py-4 font-medium text-amber-600">Easy Cron Jobs</th>
                    <th className="px-6 py-4 font-medium text-neutral-500">Serveur perso</th>
                    <th className="px-6 py-4 font-medium text-neutral-500">Alternatives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="px-6 py-4 font-medium text-neutral-700">Configuration</td>
                    <td className="px-6 py-4 text-emerald-600">✓ 2 minutes</td>
                    <td className="px-6 py-4 text-neutral-400">⚠️ 1-2 heures</td>
                    <td className="px-6 py-4 text-neutral-400">⚠️ 30+ min</td>
                  </tr>
                  <tr className="bg-neutral-50/40">
                    <td className="px-6 py-4 font-medium text-neutral-700">Fiabilité</td>
                    <td className="px-6 py-4 text-emerald-600">✓ 99.9% uptime</td>
                    <td className="px-6 py-4 text-neutral-400">✗ Dépend de vous</td>
                    <td className="px-6 py-4 text-amber-600">✓ Variable</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-neutral-700">Alertes intelligentes</td>
                    <td className="px-6 py-4 text-emerald-600">✓ Incluses</td>
                    <td className="px-6 py-4 text-neutral-400">✗ À configurer</td>
                    <td className="px-6 py-4 text-neutral-400">⚠️ Payant</td>
                  </tr>
                  <tr className="bg-neutral-50/40">
                    <td className="px-6 py-4 font-medium text-neutral-700">Interface visuelle</td>
                    <td className="px-6 py-4 text-emerald-600">✓ Intuitive</td>
                    <td className="px-6 py-4 text-neutral-400">✗ Ligne de commande</td>
                    <td className="px-6 py-4 text-amber-600">✓ Basique</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-neutral-700">Logs détaillés</td>
                    <td className="px-6 py-4 text-emerald-600">✓ 7-30 jours</td>
                    <td className="px-6 py-4 text-neutral-400">⚠️ Si configuré</td>
                    <td className="px-6 py-4 text-amber-600">✓ Limité</td>
                  </tr>
                  <tr className="bg-neutral-50/40">
                    <td className="px-6 py-4 font-medium text-neutral-700">Maintenance</td>
                    <td className="px-6 py-4 text-emerald-600">✓ Zéro</td>
                    <td className="px-6 py-4 text-neutral-400">✗ Régulière</td>
                    <td className="px-6 py-4 text-neutral-400">⚠️ Occasionnelle</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium text-neutral-700">Support</td>
                    <td className="px-6 py-4 text-emerald-600">✓ Inclus</td>
                    <td className="px-6 py-4 text-neutral-400">✗ Aucun</td>
                    <td className="px-6 py-4 text-neutral-400">⚠️ Payant</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="mx-auto w-full max-w-5xl px-6 py-24 sm:px-12"
        >
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
              💸 Tarifs transparents
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Un plan pour chaque besoin
            </h2>
            <p className="mt-3 text-neutral-600">
              Commencez gratuitement pendant 14 jours. Sans carte bancaire.
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
                        Populaire
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
                  <td className="px-6 py-5 text-neutral-500">Jobs inclus</td>
                  <td className="px-6 py-5 text-neutral-900">Jusqu'à 50 jobs</td>
                  <td className="px-6 py-5 text-neutral-900">Jobs illimités</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-5 text-neutral-500">Fréquence min.</td>
                  <td className="px-6 py-5 text-neutral-900">5 minutes</td>
                  <td className="px-6 py-5 text-neutral-900">30 secondes</td>
                </tr>
                <tr className="bg-neutral-50/60">
                  <td className="px-6 py-5 text-neutral-500">
                    Notifications email
                  </td>
                  <td className="px-6 py-5 text-neutral-900">100 / mois</td>
                  <td className="px-6 py-5 text-neutral-900">1 000 / mois</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-5 text-neutral-500">
                    Rétention des logs
                  </td>
                  <td className="px-6 py-5 text-neutral-900">7 jours</td>
                  <td className="px-6 py-5 text-neutral-900">30 jours</td>
                </tr>
                <tr className="bg-neutral-50/60">
                  <td className="px-6 py-5 text-neutral-500">Support</td>
                  <td className="px-6 py-5 text-neutral-900">Email (48h)</td>
                  <td className="px-6 py-5 text-neutral-900">Prioritaire (4h)</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-5"></td>
                  <td className="px-6 py-5">
                    <a
                      href="/signup"
                      className="inline-flex items-center justify-center rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:border-amber-300 hover:bg-amber-50"
                    >
                      Commencer
                    </a>
                  </td>
                  <td className="px-6 py-5">
                    <a
                      href="/signup"
                      className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600"
                    >
                      Essai gratuit
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-center text-sm text-neutral-500">
            Tous les plans incluent : Exécution cloud fiable • Surveillance 24/7 • Alertes automatiques • Logs détaillés
          </p>
        </section>

        <section
          id="faq"
          className="mx-auto w-full max-w-4xl px-6 py-24 sm:px-12"
        >
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1 text-sm text-amber-700">
              Questions fréquentes
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Tout ce que vous devez savoir
            </h2>
          </div>
          <div className="space-y-4">
            <details className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-amber-200">
              <summary className="cursor-pointer text-lg font-semibold text-neutral-900 list-none flex items-center justify-between">
                Comment fonctionne l'essai gratuit ?
                <span className="text-amber-600 transition group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-neutral-600">
                14 jours d'accès complet au plan Starter, sans carte bancaire. Vous pouvez annuler à tout moment sans frais.
              </p>
            </details>
            <details className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-amber-200">
              <summary className="cursor-pointer text-lg font-semibold text-neutral-900 list-none flex items-center justify-between">
                Puis-je changer de plan à tout moment ?
                <span className="text-amber-600 transition group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-neutral-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements sont appliqués immédiatement.
              </p>
            </details>
            <details className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-amber-200">
              <summary className="cursor-pointer text-lg font-semibold text-neutral-900 list-none flex items-center justify-between">
                Mes données sont-elles sécurisées ?
                <span className="text-amber-600 transition group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-neutral-600">
                Absolument. Nous utilisons un chiffrement de bout en bout, des backups quotidiens et une infrastructure certifiée. Vos logs sont stockés de manière sécurisée et ne sont jamais partagés.
              </p>
            </details>
            <details className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-amber-200">
              <summary className="cursor-pointer text-lg font-semibold text-neutral-900 list-none flex items-center justify-between">
                Que se passe-t-il si un job échoue ?
                <span className="text-amber-600 transition group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-neutral-600">
                Vous recevez instantanément une notification par email avec les logs détaillés de l'erreur. Vous pouvez aussi configurer des webhooks pour être alerté sur Slack ou Discord.
              </p>
            </details>
            <details className="group rounded-2xl border border-neutral-200 bg-white p-6 transition hover:border-amber-200">
              <summary className="cursor-pointer text-lg font-semibold text-neutral-900 list-none flex items-center justify-between">
                Puis-je utiliser des variables d'environnement ?
                <span className="text-amber-600 transition group-open:rotate-180">↓</span>
              </summary>
              <p className="mt-4 text-neutral-600">
                Oui, vous pouvez définir des variables d'environnement pour chaque job. Elles sont chiffrées et accessibles uniquement lors de l'exécution de vos commandes.
              </p>
            </details>
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
              Automatisez vos tâches en 2 minutes
            </h2>
            <p className="mt-4 text-neutral-600">
              Rejoignez 500+ développeurs qui font confiance à Easy Cron Jobs. Essai gratuit de 14 jours, sans carte bancaire.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 hover:shadow-amber-600/40"
                href="/signup"
              >
                Commencer gratuitement
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-500 px-6 py-3 text-base font-semibold text-amber-600 transition hover:border-amber-600 hover:text-amber-700"
                href="mailto:hello@easycronjobs.com"
              >
                Nous contacter
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
