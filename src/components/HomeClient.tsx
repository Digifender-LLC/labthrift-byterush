"use client";

import { useApp } from "@/lib/store";
import { useMounted } from "@/hooks/useMounted";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { Feed } from "@/components/feed/Feed";
import { BottomNav } from "@/components/BottomNav";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { Splash } from "@/components/Splash";

export function HomeClient() {
  const mounted = useMounted();
  const onboarded = useApp((s) => s.onboarded);

  if (!mounted) return <Splash />;

  if (!onboarded) return <Onboarding />;

  return (
    <div className="h-full pb-[3.4rem]">
      <Feed />
      <BottomNav />
      <CelebrationOverlay />
    </div>
  );
}
