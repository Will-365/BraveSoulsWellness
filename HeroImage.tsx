import React from "react";

type HeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  /** Fade starts around 60-70 for premium blend */
  fadeStart?: number;
  /** Fade ends at bottom (usually 100) */
  fadeEnd?: number;
  /** Overlay intensity for atmospheric blend */
  fadeIntensity?: "soft" | "medium" | "strong";
  /** Must match hero background color */
  backgroundColor?: string;
};

const intensityStops = {
  soft: [0.02, 0.1, 0.22, 0.42],
  medium: [0.03, 0.14, 0.3, 0.55],
  strong: [0.06, 0.2, 0.42, 0.72],
} as const;

export function HeroImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  fadeStart = 64,
  fadeEnd = 100,
  fadeIntensity = "medium",
  backgroundColor = "rgb(14 40 24)",
}: HeroImageProps) {
  const [s1, s2, s3, s4] = intensityStops[fadeIntensity];

  const mask = `linear-gradient(
    to bottom,
    rgba(0,0,0,1) 0%,
    rgba(0,0,0,1) ${fadeStart}%,
    rgba(0,0,0,0.95) ${Math.min(fadeStart + 8, fadeEnd)}%,
    rgba(0,0,0,0.7) ${Math.min(fadeStart + 18, fadeEnd)}%,
    rgba(0,0,0,0.35) ${Math.min(fadeStart + 28, fadeEnd)}%,
    rgba(0,0,0,0.1) ${Math.min(fadeStart + 34, fadeEnd)}%,
    rgba(0,0,0,0) ${fadeEnd}%
  )`;

  const overlayMask = `linear-gradient(
    to bottom,
    rgba(0,0,0,0) ${Math.max(fadeStart - 6, 0)}%,
    rgba(0,0,0,${s1}) ${Math.min(fadeStart + 4, fadeEnd)}%,
    rgba(0,0,0,${s2}) ${Math.min(fadeStart + 14, fadeEnd)}%,
    rgba(0,0,0,${s3}) ${Math.min(fadeStart + 26, fadeEnd)}%,
    rgba(0,0,0,${s4}) ${fadeEnd}%
  )`;

  return (
    <div className={`relative isolate ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`block h-auto w-full object-contain [filter:saturate(1.04)_contrast(1.02)] ${imageClassName}`}
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor,
          WebkitMaskImage: overlayMask,
          maskImage: overlayMask,
        }}
      />
    </div>
  );
}

export default HeroImage;
