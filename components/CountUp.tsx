"use client";

import { useLayoutEffect, useRef } from "react";

// Reads a duration variable from globals.css, so the CSS stays the one source.
// The production build may write 250ms as .25s, so both units are understood.
function cssDuration(name: string, fallback: number) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const amount = parseFloat(raw);
  if (Number.isNaN(amount)) return fallback;
  return raw.endsWith("ms") ? amount : amount * 1000;
}

// A number that counts up from 0 once, when it first appears (BRAND.md Motion).
// - The server renders the final number, so it shows without JavaScript.
// - With prefers-reduced-motion it never counts.
// - It never jumps back from the final number to 0 in plain sight: it only counts if the
//   number is still off screen, or if its section is still fading in (the page entrance).
// - Screen readers always get the final number, and the final number is also laid out
//   invisibly underneath, so the width never changes (styles: .count-up in globals.css).
export default function CountUp({ value }: { value: number }) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);

  // A layout effect runs before the browser paints this component's first client render.
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const live = liveRef.current;
    if (!wrapper || !live || value <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = wrapper.getBoundingClientRect();
    const inView = rect.bottom > 0 && rect.top < window.innerHeight;
    const section = wrapper.closest<HTMLElement>(".page > *");
    const entering = section?.getAnimations().some((animation) => animation.playState === "running") ?? false;
    if (inView && !entering) return; // already seen as the final number: leave it

    const duration = cssDuration("--motion-base", 250);
    let frame = 0;
    live.textContent = "0";

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect(); // count up only once
      // Time is measured with the animation-frame timestamps only, starting at the first frame.
      let start: number | undefined;
      const tick = (now: number) => {
        start ??= now;
        const progress = Math.min(Math.max((now - start) / duration, 0), 1);
        const eased = 1 - (1 - progress) ** 3; // ease-out
        live.textContent = String(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      live.textContent = String(value);
    };
  }, [value]);

  return (
    <span ref={wrapperRef} className="count-up">
      <span className="count-up-space" aria-hidden="true">{value}</span>
      <span ref={liveRef} aria-hidden="true">{value}</span>
      <span className="visually-hidden">{value}</span>
    </span>
  );
}
