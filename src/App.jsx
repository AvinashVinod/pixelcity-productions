import React, { useCallback, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LenisManager from "./utils/lenis";
import { client } from "./utils/client";

import Preloader from "./components/Preloader";
import BannerHomepage from "./components/BannerHomepage";
import Navbar from "./partials/Navbar";
import MarqueeEffect from "./partials/MarqueeEffect";
import WhyUs from "./components/WhyUs";
import Collection from "./components/Collection";
import AboutHomepage from "./components/AboutHomepage";
import TestimonialsHomepage from "./components/TestimonialsHomepage";
import InstagramHomepage from "./components/InstagramHomepage";
import Footer from "./partials/Footer";
import AboutPage from "./pages/AboutPage";
import WeddingPage from "./pages/WeddingPage";
import WeddingDetailPage from "./pages/WeddingDetailPage";
import PreWeddingPage from "./pages/PreWeddingPage";
import PreWeddingDetailPage from "./pages/PreWeddingDetailPage";
import TestimonialsPage from "./pages/TestimonialsPage";
import ContactPage from "./pages/ContactPage";
import Monochrome from "./pages/Monochrome";
import Films from "./pages/Films";
import Whatsapp from "../public/Whatsapp";

if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

// Pages where scrolling is locked for a fixed intro duration
const NO_SCROLL_PAGES = ["/wedding", "/pre-wedding"];
const NO_SCROLL_PAGES_LOCK_MS = 6500;
// Last-resort unlock for the homepage if something goes badly wrong
const HOME_INTRO_FAILSAFE_MS = 25000;

// ── Fallback collection so Collection always has something to render ──
const FALLBACK_COLLECTION = [
  {
    heading: "Pre-wedding Photography",
    imageUrl:
      "https://images.unsplash.com/photo-1749522025490-aee529bbf594?q=80&w=2070&auto=format&fit=crop",
    alt: "Pre-wedding",
    order: 1,
  },
  {
    heading: "Wedding films",
    imageUrl:
      "https://images.unsplash.com/photo-1744804298523-9e4ddf5e6dc4?q=80&w=2070&auto=format&fit=crop",
    alt: "Wedding films",
    order: 2,
  },
  {
    heading: "Pre-wedding films",
    imageUrl:
      "https://images.unsplash.com/photo-1727430334140-c21dc3d415f1?q=80&w=2070&auto=format&fit=crop",
    alt: "Pre-wedding films",
    order: 3,
  },
  {
    heading: "Wedding photography",
    imageUrl:
      "https://images.unsplash.com/photo-1727430334033-d2ffe559bdce?q=80&w=1974&auto=format&fit=crop",
    alt: "Wedding photography",
    order: 4,
  },
];

const HOMEPAGE_QUERY = `{
    "homepage": *[_type == "homepage"][0] {
        _id,
        "mainImage": {
            "mobile": mainImage.mobile.asset->url,
            "mobileAlt": mainImage.mobile.alt,
            "tablet": mainImage.tablet.asset->url,
            "tabletAlt": mainImage.tablet.alt,
            "laptop": mainImage.laptop.asset->url,
            "laptopAlt": mainImage.laptop.alt
        },
        whyUsDescription,
        aboutDescription,
        "whyUsImageUrl": whyUsImage.asset->url,
        "whyUsImageAlt": whyUsImage.alt,
        "aboutImageUrl": aboutImage.asset->url,
        "aboutImageAlt": aboutImage.alt,
        "collectionItems": [
            { "heading": firstImage.heading, "url": firstImage.url,  "imageUrl": firstImage.image.asset->url,  "alt": firstImage.image.alt,  "order": 1 },
            { "heading": secondImage.heading, "url": secondImage.url, "imageUrl": secondImage.image.asset->url, "alt": secondImage.image.alt, "order": 2 },
            { "heading": thirdImage.heading, "url": thirdImage.url,  "imageUrl": thirdImage.image.asset->url,  "alt": thirdImage.image.alt,  "order": 3 },
            { "heading": fourthImage.heading, "url": fourthImage.url, "imageUrl": fourthImage.image.asset->url, "alt": fourthImage.image.alt, "order": 4 }
        ],
        "instagramPosts": instagramPosts[] {
            "imageUrl": image.asset->url,
            "imageAlt": image.alt,
            url
        }
    },
    "testimonials": *[_type == "testimonial" && featured == true] | order(date desc) {
        _id,
        coupleName,
        review,
        rating,
        date,
        "imageUrl": image.asset->url,
        "imageAlt": image.alt
    }
}`;

const App = () => {
  const { pathname, key } = useLocation();
  const isHome = pathname === "/";
  const lenisManagerRef = useRef(null);

  // ── CMS data ──
  const [homepageData, setHomepageData] = useState(null);
  const [testimonialsData, setTestimonialsData] = useState([]);
  const [homepageReady, setHomepageReady] = useState(false); // fetch settled (ok or error)

  // ── Preloader only on a fresh load / reload of the homepage ──
  // Once the user navigates anywhere inside the app, it never plays again
  // (until the next full page reload).
  const initialKeyRef = useRef(key);
  const [hasNavigated, setHasNavigated] = useState(false);
  useEffect(() => {
    if (key !== initialKeyRef.current) setHasNavigated(true);
  }, [key]);
  const playIntro = isHome && !hasNavigated && key === initialKeyRef.current;

  // ── Intro sequencing, stored per location key so each homepage visit
  //    gets its own reveal without any "reset" flicker ──
  const [preloaderDoneKey, setPreloaderDoneKey] = useState(null);
  const [introStartKey, setIntroStartKey] = useState(null);
  const [introDoneKey, setIntroDoneKey] = useState(null);
  const preloaderDone = isHome && preloaderDoneKey === key; // grid finished → banner may enter
  const introStarted = isHome && introStartKey === key; // banner image ready & sliding up → navbar may enter
  const introDone = isHome && introDoneKey === key; // banner covered screen → unlock + unmount preloader

  const handlePreloaderComplete = useCallback(() => setPreloaderDoneKey(key), [key]);
  const handleIntroStart = useCallback(() => setIntroStartKey(key), [key]);
  const handleIntroComplete = useCallback(() => setIntroDoneKey(key), [key]);

  // ── Fetch homepage content ──
  useEffect(() => {
    if (!isHome) return;

    client
      .fetch(HOMEPAGE_QUERY)
      .then((data) => {
        setHomepageData(data?.homepage ?? null);
        setTestimonialsData(data?.testimonials ?? []);
      })
      .catch((err) => console.error("Homepage fetch error:", err))
      .finally(() => setHomepageReady(true));
  }, [isHome]);

  // ── Lenis ──
  useEffect(() => {
    const lenisManager = new LenisManager();
    lenisManagerRef.current = lenisManager;
    window.lenisInstance = lenisManager.lenis;
    return () => {
      window.lenisInstance = null;
      lenisManager.destroy();
    };
  }, []);

  // ── Scroll lock helpers ──
  const lockScroll = useCallback(() => {
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    lenisManagerRef.current?.lenis?.stop();
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.height = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    lenisManagerRef.current?.lenis?.start();
    setTimeout(() => ScrollTrigger.refresh(true), 100);
  }, []);

  // ── Lock / unlock based on page + intro state ──
  useEffect(() => {
    // Homepage: locked until the banner has actually covered the preloader
    if (isHome) {
      if (introDone) {
        unlockScroll();
        return;
      }
      lockScroll();
      const failsafe = setTimeout(unlockScroll, HOME_INTRO_FAILSAFE_MS);
      return () => clearTimeout(failsafe);
    }

    // Wedding / pre-wedding: fixed-duration lock
    if (NO_SCROLL_PAGES.includes(pathname)) {
      lockScroll();
      const timer = setTimeout(unlockScroll, NO_SCROLL_PAGES_LOCK_MS);
      return () => clearTimeout(timer);
    }

    unlockScroll();
  }, [pathname, isHome, introDone, lockScroll, unlockScroll]);

  // ── ALWAYS scroll to top on any page change / reload ──
  useEffect(() => {
    // force: true so it works even while Lenis is stopped
    lenisManagerRef.current?.lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname, key]);

  return (
    <div className="h-full w-full min-h-dvh overflow-hidden">
      <Navbar playIntro={playIntro} introReady={introStarted} />
      <Routes>
        <Route
          path="/"
          element={
            <React.Fragment key={key}>
              {/* First load only; unmounted once the banner fully covers it */}
              {playIntro && !introDone && (
                <Preloader onLoadingComplete={handlePreloaderComplete} />
              )}

              <BannerHomepage
                mainImage={homepageData?.mainImage}
                dataReady={homepageReady}
                // First load: wait for the preloader. Coming from another page: go straight away.
                start={playIntro ? preloaderDone : true}
                heroWaitMs={playIntro ? 6000 : 2500}
                onIntroStart={handleIntroStart}
                onIntroComplete={handleIntroComplete}
              />

              <div className="relative z-20">
                <MarqueeEffect />
                <WhyUs 
                  description={homepageData?.whyUsDescription}
                  imageUrl={homepageData?.whyUsImageUrl}
                  imageAlt={homepageData?.whyUsImageAlt}
                />
                <Collection items={homepageData?.collectionItems ?? FALLBACK_COLLECTION} />
                <AboutHomepage
                  description={homepageData?.aboutDescription}
                  imageUrl={homepageData?.aboutImageUrl}
                  imageAlt={homepageData?.aboutImageAlt}
                />
                <TestimonialsHomepage testimonials={testimonialsData} />
                <InstagramHomepage posts={homepageData?.instagramPosts ?? []} />
              </div>
            </React.Fragment>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/wedding" element={<WeddingPage />} />
        <Route path="/wedding/:slug" element={<WeddingDetailPage />} />
        <Route path="/monochrome" element={<Monochrome />} />
        <Route path="/films" element={<Films />} />
        <Route path="/pre-wedding" element={<PreWeddingPage />} />
        <Route path="/pre-wedding/:slug" element={<PreWeddingDetailPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;