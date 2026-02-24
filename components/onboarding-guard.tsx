"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const ONBOARDING_PATH = "/onboarding";
const DASHBOARD_PATH = "/dashboard";
const PROTECTED_PATHS_NEED_ONBOARDING = ["/dashboard", "/kyc", "/skus"];

function pathNeedsOnboarding(pathname: string): boolean {
  return PROTECTED_PATHS_NEED_ONBOARDING.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setChecked(true);
      return;
    }

    let cancelled = false;

    fetch("/api/onboarding-status", { credentials: "include" })
      .then((res) => res.json())
      .then((data: { hasOnboarding?: boolean }) => {
        if (cancelled) return;
        const hasOnboarding = Boolean(data.hasOnboarding);

        if (pathname === ONBOARDING_PATH && hasOnboarding) {
          router.replace(DASHBOARD_PATH);
          return;
        }
        if (pathNeedsOnboarding(pathname) && !hasOnboarding) {
          router.replace(ONBOARDING_PATH);
          return;
        }
      })
      .catch(() => {
        if (!cancelled) setChecked(true);
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, isSignedIn, isLoaded, router]);

  return <>{children}</>;
}
