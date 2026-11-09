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
        "main > section:not(:first-of-type), main > footer, .motion-cluster > *",
      ),
    );

    root.classList.remove("route-leaving");
    root.classList.add("motion-ready", "route-entering");
    const routeEntryTimer = window.setTimeout(
      () => root.classList.remove("route-entering"),
      reducedMotion ? 0 : 300,
    );
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

    const sectionLinks = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section-link]"),
    );
    const trackedSections = ["universities", "shortlist", "living-cost", "readiness"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const setCurrentSection = (id: string) => {
      sectionLinks.forEach((link) => {
        const current = link.dataset.sectionLink === id;
        link.classList.toggle("is-current", current);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrentSection(visible.target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.15, 0.35] },
    );
    trackedSections.forEach((section) => sectionObserver.observe(section));
    if (trackedSections.length) setCurrentSection(trackedSections[0].id);

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

    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      const sameDocumentAnchor =
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        Boolean(destination.hash);

      if (destination.origin !== window.location.origin || sameDocumentAnchor) return;
      root.classList.add("route-leaving");
      if (progressRef.current) progressRef.current.style.transform = "scaleX(1)";
    };

    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("click", onDocumentClick);

    return () => {
      observer?.disconnect();
      sectionObserver.disconnect();
      window.clearTimeout(routeEntryTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("click", onDocumentClick);
      if (frame) window.cancelAnimationFrame(frame);
      targets.forEach((target) => {
        target.classList.remove("interface-reveal", "is-visible");
        target.style.removeProperty("--reveal-delay");
      });
      sectionLinks.forEach((link) => {
        link.classList.remove("is-current");
        link.removeAttribute("aria-current");
      });
    };
  }, [pathname]);

  return (
    <div className="page-progress" aria-hidden="true">
      <span ref={progressRef} />
    </div>
  );
}
