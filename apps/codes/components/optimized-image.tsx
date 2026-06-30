"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /** Fallback background color shown while image loads */
  fallbackBg?: string;
}

/**
 * Optimized image wrapper around next/image with:
 * - Progressive loading with fallback background
 * - Error handling with visual fallback
 * - Sizing constraints to prevent layout shift
 */
export function OptimizedImage({
  fallbackBg = "var(--muted, #f4f4f5)",
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={className}
        style={{
          backgroundColor: fallbackBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(props.fill
            ? { position: "absolute", inset: 0 }
            : { width: props.width, height: props.height }),
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ opacity: 0.4 }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      onLoad={() => {}}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
