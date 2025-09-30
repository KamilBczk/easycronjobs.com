import { auth } from "@/auth";
import { NextResponse } from "next/server";

// Note: On doit utiliser auth de manière compatible avec Edge Runtime
export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Pages publiques autorisées
  const publicPaths = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
  if (publicPaths.includes(pathname) || pathname.startsWith("/blog")) {
    return NextResponse.next();
  }

  // Si pas de session et pas sur une page publique, rediriger vers login
  if (!req.auth && pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Pages /app autorisées sans vérification d'abonnement
  const allowedWithoutSubscription = [
    "/app/billing",
    "/app/profile",
    "/app/settings",
  ];

  if (allowedWithoutSubscription.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Pages admin autorisées (vérification admin faite dans les pages)
  if (pathname.startsWith("/app/admin")) {
    return NextResponse.next();
  }

  // Pour toutes les autres pages /app/*, la vérification détaillée d'abonnement
  // se fait dans le layout via SubscriptionGuard car le middleware ne peut pas
  // facilement accéder à Prisma en Edge Runtime

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};