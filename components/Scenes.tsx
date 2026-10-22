"use client";

import dynamic from "next/dynamic";

export const Background = dynamic(() => import("./BackgroundScene"), {
  ssr: false,
  loading: () => <div className="bg-fallback" aria-hidden="true" />,
});

export const Hero = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div
      className="hero-scene"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(520px 300px at 72% 18%, rgba(34,211,238,0.18), transparent 65%), radial-gradient(420px 260px at 20% 90%, rgba(244,63,94,0.12), transparent 60%)",
      }}
    />
  ),
});
