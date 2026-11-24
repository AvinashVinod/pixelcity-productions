import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { preloadImage } from "../utils/preloadImage";

gsap.registerPlugin(useGSAP);

// ─── Config ────────────────────────────────────────────────────────────────
const TOTAL_IMAGES = 40; // wedding-1.jpg … wedding-40.jpg
const LOGO_SPAN = 2; // logo occupies a 2x2 block
const LOAD_TIMEOUT_MS = 12000; // slow network safety net — never hang forever
const CENTER_IMAGE = "/images/preloader_center-img.jpeg";
const LOGO_IMAGE = "/images/logo-white.png";

const PRELOADER_IMAGES = Array.from({ length: TOTAL_IMAGES }, (_, i) => ({
  id: i,
  src: `/images/preloader/wedding-${i + 1}.jpg`,
  alt: `Wedding ${i + 1}`,
}));

// ─── Helpers ───────────────────────────────────────────────────────────────
const getViewportWidth = () =>
  typeof window !== "undefined" ? window.innerWidth : 1280;

const getGridConfig = (width) => {
  if (width < 640) return { columns: 4, rows: 6, gap: "gap-1", padding: "p-1" }; // Mobile
  if (width < 1024) return { columns: 6, rows: 6, gap: "gap-1.5", padding: "p-1.5" }; // Tablets
  if (width < 1280) return { columns: 6, rows: 4, gap: "gap-2", padding: "p-2" }; // Small desktop
  return { columns: 8, rows: 4, gap: "gap-2", padding: "p-2" }; // Large desktop
};

const getSlotCount = ({ columns, rows }) => columns * rows - LOGO_SPAN * LOGO_SPAN;

const getLogoPosition = ({ columns, rows }) => ({
  row: Math.floor((rows - LOGO_SPAN) / 2),
  col: Math.floor((columns - LOGO_SPAN) / 2),
});

// ─── Component ─────────────────────────────────────────────────────────────
const Preloader = ({ onLoadingComplete }) => {
  const rootRef = useRef(null);
  const overlayRef = useRef(null);
  const gridRef = useRef(null);

  // Keep latest callback without re-triggering the timeline
  const onCompleteRef = useRef(onLoadingComplete);
  useEffect(() => {
    onCompleteRef.current = onLoadingComplete;
  }, [onLoadingComplete]);

  const [gridConfig, setGridConfig] = useState(() => getGridConfig(getViewportWidth()));
  const [isReady, setIsReady] = useState(false);
  const [readyImages, setReadyImages] = useState([]);
  const [centerReady, setCenterReady] = useState(false);
  const [progress, setProgress] = useState(0);

  // ── Resize: only update state when the grid shape actually changes ──
  useEffect(() => {
    const handleResize = () => {
      const next = getGridConfig(window.innerWidth);
      setGridConfig((prev) =>
        prev.columns === next.columns && prev.rows === next.rows ? prev : next,
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Load + decode every image the grid needs BEFORE anything is shown ──
  useEffect(() => {
    let cancelled = false;
    let timeoutId;

    // Only download what this screen size actually displays
    const slotCount = getSlotCount(getGridConfig(getViewportWidth()));
    const targets = PRELOADER_IMAGES.slice(0, Math.min(TOTAL_IMAGES, slotCount));
    const sources = [CENTER_IMAGE, LOGO_IMAGE, ...targets.map((img) => img.src)];

    const succeeded = new Set();
    let settled = 0;

    const tasks = sources.map((src) =>
      preloadImage(src)
        .then(() => succeeded.add(src))
        .catch((err) => console.warn("[Preloader]", err.message))
        .finally(() => {
          settled += 1;
          if (!cancelled) setProgress(settled / sources.length);
        }),
    );

    const timeout = new Promise((resolve) => {
      timeoutId = setTimeout(resolve, LOAD_TIMEOUT_MS);
    });

    Promise.race([Promise.all(tasks), timeout]).then(() => {
      clearTimeout(timeoutId);
      if (cancelled) return;
      // Only images that are fully decoded make it into the grid —
      // failed / still-loading ones are skipped, never shown as blank boxes.
      setReadyImages(targets.filter((img) => succeeded.has(img.src)));
      setCenterReady(succeeded.has(CENTER_IMAGE));
      setIsReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  // ── Intro timeline — runs only once everything is decoded ──
  useGSAP(
    () => {
      if (!isReady || !gridRef.current) return;

      const grid = gridRef.current;
      const logo = grid.querySelector(".preloader-logo");
      const items = grid.querySelectorAll(".preloader-grid-item");

      const tl = gsap.timeline({
        onComplete: () => onCompleteRef.current?.(),
      });

      tl.fromTo(
        logo,
        { y: 50, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1.5, ease: "power3.out" },
      );

      if (items.length) {
        tl.fromTo(
          items,
          { y: 50, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 2.5,
            ease: "power2.out",
            stagger: { each: 0.15, from: "center", grid: "auto" },
          },
        );
      }

      tl.to(overlayRef.current, { opacity: 1, duration: 0.7, ease: "expo.out" });
    },
    { scope: rootRef, dependencies: [isReady] },
  );

  // ── Grid ──
  const renderGridItems = () => {
    const { columns, rows } = gridConfig;
    const logoPos = getLogoPosition(gridConfig);
    const cells = [];
    let slot = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const isLogoArea =
          row >= logoPos.row &&
          row < logoPos.row + LOGO_SPAN &&
          col >= logoPos.col &&
          col < logoPos.col + LOGO_SPAN;

        if (isLogoArea) {
          if (row === logoPos.row && col === logoPos.col) {
            cells.push(
              <div
                key="logo"
                className="preloader-logo relative z-10 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-sm bg-black text-white md:gap-5"
                style={{
                  gridColumn: `${logoPos.col + 1} / span ${LOGO_SPAN}`,
                  gridRow: `${logoPos.row + 1} / span ${LOGO_SPAN}`,
                }}
              >
                {centerReady && (
                  <div className="absolute z-0 h-full w-full">
                    <img src={CENTER_IMAGE} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="absolute z-1 h-full w-full bg-black/30" />
                <div className="relative z-2 h-20 w-20 md:h-35 md:w-35">
                  <img className="h-full w-full object-contain" src={LOGO_IMAGE} alt="Logo" />
                </div>
              </div>,
            );
          }
          continue;
        }

        // Cycle through the decoded images so every cell has a photo,
        // even if a few files failed or the viewport grew after loading.
        const image = readyImages.length ? readyImages[slot % readyImages.length] : null;

        cells.push(
          <div
            key={`cell-${slot}`}
            className="preloader-grid-item overflow-hidden rounded-sm bg-neutral-900"
          >
            {image && (
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover"
                loading="eager"
                draggable={false}
              />
            )}
          </div>,
        );
        slot++;
      }
    }

    return cells;
  };

  return (
    <div ref={rootRef} className="fixed top-0 left-0 z-5 h-full w-full">
      <div
        ref={overlayRef}
        className="pointer-events-none absolute z-10 h-full w-full bg-black/70 opacity-0"
      />

      <div className="relative z-0 h-full w-full bg-black">
        {isReady ? (
          <div
            ref={gridRef}
            className={`grid ${gridConfig.gap} ${gridConfig.padding} h-dvh w-full`}
            style={{
              gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
              overflow: "hidden",
            }}
          >
            {renderGridItems()}
          </div>
        ) : (
          // While loading: pure black + a quiet counter. No grey boxes.
          <div className="flex h-dvh w-full items-end justify-end p-6 md:p-10">
            <span className="small-para tracking-widest text-white/50 tabular-nums">
              {String(Math.round(progress * 100)).padStart(3, "0")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preloader;