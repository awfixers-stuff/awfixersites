"use client";

import { useEffect, useState, type RefObject } from "react";

export function useAnimationActive(ref: RefObject<Element | null>) {
  const [isVisible, setIsVisible] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? false);
      },
      { rootMargin: "50px", threshold: 0 },
    );

    observer.observe(element);

    const onVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState === "visible");
    };

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [ref]);

  return isVisible && isDocumentVisible;
}
