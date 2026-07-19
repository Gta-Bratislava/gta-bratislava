"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { loadPublicSettings } from "@/lib/supabase-browser";

export function LiveHeroVisual({ fallback = "/brand/gta-bratislava-logo.jpg" }: { fallback?: string }) {
  const [source, setSource] = useState(fallback);
  useEffect(() => {
    let active = true;
    void loadPublicSettings().then((settings) => { if (active && settings?.hero_image_url) setSource(settings.hero_image_url); }).catch(() => undefined);
    return () => { active = false; };
  }, [fallback]);
  return <Image src={source} alt="GTA Bratislava — Grand the Auto" fill priority sizes="(max-width: 1024px) 90vw, 46vw" className="object-cover" />;
}

