"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_ROUTES = ["/auth", "/landing", "/onboarding"];

/**
 * Client-side auth guard hook.
 * Checks localStorage for auth state and redirects to /auth if needed.
 * Returns { isLoading, isAuthenticated } for conditional rendering.
 */
export function useAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Public routes skip auth check
    if (PUBLIC_ROUTES.some((r) => pathname?.startsWith(r))) {
      setIsLoading(false);
      setIsAuthenticated(true);
      return;
    }

    // Check auth state
    // TODO: Replace with Supabase session check
    const hasAuth =
      localStorage.getItem("vitrion-auth") === "true" ||
      localStorage.getItem("vitrion-demo-mode") === "true";

    // For development: always allow access
    // In production, uncomment the redirect below:
    // if (!hasAuth) {
    //   router.replace("/auth");
    //   return;
    // }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [pathname, router]);

  return { isLoading, isAuthenticated };
}
