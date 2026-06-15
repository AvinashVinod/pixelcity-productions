import React, { useEffect, useRef, useState } from "react";
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

if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

// Pages where scrolling should be DISABLED
const NO_SCROLL_PAGES = ["/wedding", "/pre-wedding"];

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

const App = () => {
  const { pathname, key } = useLocation();
  const lenisManagerRef = useRef(null);

  // ── null = not fetched yet, data fills in when ready ──
  const [homepageData, setHomepageData] = useState(null);
  const [testimonialsData, setTestimonialsData] = useState([]);

  useEffect(() => {
    if (pathname !== "/") return;

    client
      .fetch(
        `{
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
}`,
      )
      .then((data) => {
        setHomepageData(data.homepage);
        setTestimonialsData(data.testimonials ?? []);
      })
      .catch((err) => console.error("Homepage fetch error:", err));
  }, [pathname]);

  useEffect(() => {
    const lenisManager = new LenisManager();
    lenisManagerRef.current = lenisManager;
    window.lenisInstance = lenisManager.lenis;
    return () => {
      window.lenisInstance = null;
      lenisManager.destroy();
    };
  }, []);

  // Handle scroll locking/unlocking based on current page
  useEffect(() => {
    const shouldLockScroll = NO_SCROLL_PAGES.includes(pathname);

    const lockScroll = () => {
      document.body.style.height = "100vh";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      lenisManagerRef.current?.lenis?.stop();
    };

    const unlockScroll = () => {
      document.body.style.height = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      lenisManagerRef.current?.lenis?.start();
      setTimeout(() => ScrollTrigger.refresh(true), 100);
    };

    let timer;

    if (shouldLockScroll) {
      lockScroll();
      // 6.5 seconds for wedding & pre-wedding pages
      timer = setTimeout(unlockScroll, 6500);
      return () => {
        clearTimeout(timer);
        unlockScroll();
      };
    } else if (pathname === "/") {
      lockScroll();
      // 5.5 seconds for homepage
      timer = setTimeout(unlockScroll, 5500);
      return () => {
        clearTimeout(timer);
        unlockScroll();
      };
    } else {
      unlockScroll();
    }

    // ALWAYS scroll to top on ANY page change/reload
    lenisManagerRef.current?.lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <div className="h-full w-full min-h-dvh overflow-hidden">
      <Navbar
        introKey={pathname === "/" ? key : "static"}
        isHomeRoute={pathname === "/"}
      />
      <Routes>
        <Route
          path="/"
          element={
            <React.Fragment key={key}>
              <Preloader />
              <BannerHomepage mainImage={homepageData?.mainImage} />
              <div className="relative z-20">
                <MarqueeEffect />
                <WhyUs description={homepageData?.whyUsDescription} />
                <Collection
                  items={homepageData?.collectionItems ?? FALLBACK_COLLECTION}
                />
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
