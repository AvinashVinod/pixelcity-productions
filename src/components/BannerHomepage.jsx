// BannerHomepage.jsx — reveals only after the Preloader finishes AND the hero image is decoded
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useMemo, useRef, useState } from "react";
import LinkRevealingEffect from "../partials/LinkRevealingEffect";
import { preloadImage } from "../utils/preloadImage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1640953146604-2596432ee1eb?q=80&w=2136&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
const DEFAULT_ALT = "Wedding Background";
// If the hero image is still not ready this long after the preloader ends, reveal anyway
const HERO_WAIT_TIMEOUT_MS = 6000;

const getBreakpoint = (width) =>
  width <= 768 ? "mobile" : width <= 1024 ? "tablet" : "laptop";

const pickHero = (mainImage, breakpoint) => {
  if (!mainImage) return { src: FALLBACK_IMAGE, alt: DEFAULT_ALT };

  if (breakpoint === "mobile") {
    return {
      src: mainImage.mobile || mainImage.tablet || mainImage.laptop || FALLBACK_IMAGE,
      alt: mainImage.mobileAlt || mainImage.laptopAlt || DEFAULT_ALT,
    };
  }
  if (breakpoint === "tablet") {
    return {
      src: mainImage.tablet || mainImage.laptop || FALLBACK_IMAGE,
      alt: mainImage.tabletAlt || mainImage.laptopAlt || DEFAULT_ALT,
    };
  }
  return {
    src: mainImage.laptop || FALLBACK_IMAGE,
    alt: mainImage.laptopAlt || DEFAULT_ALT,
  };
};

/**
 * @param mainImage       Sanity responsive image object
 * @param dataReady       true once the homepage fetch has settled (success or error)
 * @param start           true once the Preloader timeline has finished (or immediately if no preloader)
 * @param heroWaitMs      max time to wait for the hero image after `start` before revealing anyway
 * @param onIntroStart    called the moment the banner starts sliding up (hero image ready)
 * @param onIntroComplete called when the banner has fully covered the preloader
 */
const BannerHomepage = ({
  mainImage,
  dataReady = true,
  start = true,
  heroWaitMs = HERO_WAIT_TIMEOUT_MS,
  onIntroStart,
  onIntroComplete,
}) => {
  const wrapperRef = useRef(null);
  const bannerRef = useRef(null);
  const imageRef = useRef(null);

  const onIntroStartRef = useRef(onIntroStart);
  const onIntroCompleteRef = useRef(onIntroComplete);
  useEffect(() => {
    onIntroStartRef.current = onIntroStart;
    onIntroCompleteRef.current = onIntroComplete;
  }, [onIntroStart, onIntroComplete]);

  const [breakpoint, setBreakpoint] = useState(() =>
    typeof window === "undefined" ? "laptop" : getBreakpoint(window.innerWidth),
  );
  const [hero, setHero] = useState(null); // only set once the image is decoded
  const [heroTimedOut, setHeroTimedOut] = useState(false);

  // ── Track breakpoint (state only changes when crossing a breakpoint) ──
  useEffect(() => {
    const handleResize = () => setBreakpoint(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Wait for CMS data before choosing, so we never download the fallback for nothing
  const target = useMemo(
    () => (dataReady ? pickHero(mainImage, breakpoint) : null),
    [dataReady, mainImage, breakpoint],
  );

  // ── Preload hero in the background (runs while the preloader is still animating) ──
  useEffect(() => {
    if (!target) return;
    let cancelled = false;

    const load = async () => {
      try {
        await preloadImage(target.src);
        if (!cancelled) setHero(target);
      } catch {
        try {
          await preloadImage(FALLBACK_IMAGE);
          if (!cancelled) setHero({ src: FALLBACK_IMAGE, alt: target.alt });
        } catch {
          /* the timeout below will still reveal the banner */
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [target]);

  // ── Safety net: never keep the user stuck on the preloader ──
  useEffect(() => {
    if (!start || hero) return;
    const t = setTimeout(() => setHeroTimedOut(true), heroWaitMs);
    return () => clearTimeout(t);
  }, [start, hero, heroWaitMs]);

  const canReveal = start && (Boolean(hero) || heroTimedOut);
  const imgSrc = hero?.src ?? (heroTimedOut ? target?.src ?? FALLBACK_IMAGE : null);
  const imgAlt = hero?.alt ?? target?.alt ?? DEFAULT_ALT;

  // ── Entrance + parallax — only when preloader is done AND image is ready ──
  useGSAP(
    () => {
      if (!canReveal) return;

      onIntroStartRef.current?.();

      gsap.timeline({ defaults: { ease: "expo.out" } }).to(bannerRef.current, {
        y: "0%",
        duration: 1.4,
        onComplete: () => {
          ScrollTrigger.refresh();
          onIntroCompleteRef.current?.();
        },
      });

      if (imageRef.current) {
        // Trigger on the untransformed wrapper so start/end are measured correctly
        gsap.to(imageRef.current, {
          y: "20%",
          scale: 1.2,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    },
    { scope: wrapperRef, dependencies: [canReveal] },
  );

  return (
    <div ref={wrapperRef} className="relative w-full h-[120vh] overflow-hidden bg-black">
      <div
        ref={bannerRef}
        className="relative z-20 h-[120vh] w-full translate-y-full bg-black overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-start justify-center h-full w-full text-white p-[1rem] sm:p-[2rem]">
          {/* Content */}
          <div className="relative z-3 w-full">
            <div className="flex justify-between uppercase">
              <p className="small-para tracking-widest mb-20">
                <span>✦</span> Wedding films &amp; photography
              </p>
              <p className="small-para tracking-widest hidden md:block">est. 2016, india</p>
            </div>
            <div className="w-[85%]">
              <h2 className="text-white text-[28vw] sm:text-[10rem] lg:text-[14vw] h2 leading-[24vw] sm:leading-[8rem] lg:leading-[12vw] font-light opacity-90 capitalize mb-12 [word-spacing:-0.9rem]">
                Stories <br />
                <span className="inline-block text-[#CFA86D]">woven in light.</span>
              </h2>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-15 md:gap-0 w-full">
                <p className="sm:w-md">
                  It's your wedding — it should be unique. We craft cinematic films and timeless
                  photographs.
                </p>
                <div className="link-revealing relative bottom-2.5 flex items-center gap-2.5 group uppercase">
                  <a href="" className="text-box-trim relative cursor-pointer transition-colors">
                    View our films
                  </a>
                  <LinkRevealingEffect />
                </div>
              </div>
            </div>
          </div>

          {/* Dark overlay */}
          <div className="absolute z-2 inset-0 h-full w-full bg-black/50" />

          {/* Parallax image — src is always an already-decoded URL, so it never pops in */}
          <div className="absolute z-1 inset-0 h-[150vh] w-full -top-[10%]">
            {imgSrc && (
              <img
                ref={imageRef}
                className="will-change-transform w-full h-full object-cover"
                src={imgSrc}
                alt={imgAlt}
                fetchPriority="high"
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerHomepage;