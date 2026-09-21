"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function InterfaceMotion() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "main > header, main > nav, main > section, main > footer, .motion-cluster > *",
      ),
    );

    root.classList.add("motion-ready");
    targets.forEach((target, index) => {
      target.classList.add("interface-reveal");
      target.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
    });

    const observer = reducedMotion
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer?.unobserve(entry.target);
              }
            }
          },
          { rootMargin: "0px 0px -8%", threshold: 0.06 },
        );

    targets.forEach((target) => {
      if (reducedMotion) target.classList.add("is-visible");
      else observer?.observe(target);
    });

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      targets.forEach((target) => {
        target.classList.remove("interface-reveal", "is-visible");
        target.style.removeProperty("--reveal-delay");
      });
    };
  }, [pathname]);

  return (
    <div className="page-progress" aria-hidden="true">
      <span ref={progressRef} />
    </div>
  );
}
