// BannerHomepage.js - Updated with responsive images and fallback
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useRef, useState, useEffect } from "react";
import LinkRevealingEffect from "../partials/LinkRevealingEffect";

gsap.registerPlugin(ScrollTrigger);

// Fallback image URL (your existing Unsplash image)
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1640953146604-2596432ee1eb?q=80&w=2136&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const BannerHomepage = ({ mainImage }) => {
  const bannerRef = useRef();
  const imageRef = useRef();
  const [currentImage, setCurrentImage] = useState(FALLBACK_IMAGE); // Start with fallback
  const [currentAlt, setCurrentAlt] = useState("Wedding Background");

  // Handle responsive image selection based on screen size
  useEffect(() => {
    const updateImage = () => {
      const width = window.innerWidth;
      
      // If mainImage data is available, use it; otherwise keep fallback
      if (mainImage) {
        let imageUrl = mainImage?.laptop || FALLBACK_IMAGE;
        
        if (width <= 768) {
          imageUrl = mainImage?.mobile || mainImage?.tablet || mainImage?.laptop || FALLBACK_IMAGE;
        } else if (width <= 1024) {
          imageUrl = mainImage?.tablet || mainImage?.laptop || FALLBACK_IMAGE;
        } else {
          imageUrl = mainImage?.laptop || FALLBACK_IMAGE;
        }
        
        setCurrentImage(imageUrl);
        
        // Update alt text
        if (width <= 768) {
          setCurrentAlt(mainImage?.mobileAlt || mainImage?.laptopAlt || 'Wedding Background');
        } else if (width <= 1024) {
          setCurrentAlt(mainImage?.tabletAlt || mainImage?.laptopAlt || 'Wedding Background');
        } else {
          setCurrentAlt(mainImage?.laptopAlt || 'Wedding Background');
        }
      } else {
        // Keep fallback if no mainImage data
        setCurrentImage(FALLBACK_IMAGE);
        setCurrentAlt("Wedding Background");
      }
    };

    updateImage();
    window.addEventListener('resize', updateImage);
    return () => window.removeEventListener('resize', updateImage);
  }, [mainImage]);

  useGSAP(() => {
    // ── Entrance animation ──────────────────────────────────────────────────
    const tl = gsap.timeline({
      delay: 4.5,
      defaults: { ease: "expo.out" },
    });

    tl.to(bannerRef.current, {
      y: "0%",
      duration: 1.4,
      onComplete: () => {
        ScrollTrigger.refresh();

        if (imageRef.current) {
          gsap.to(imageRef.current, {
            y: "20%",
            scale: 1.2,
            ease: "none",
            scrollTrigger: {
              trigger: bannerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }
      },
    });
  }, { scope: bannerRef });

  return (
    <div className="relative w-full h-[120vh] overflow-hidden bg-black">
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
                  It's your wedding — it should be unique. We craft cinematic films and timeless photographs.
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
          <div className="absolute z-2 inset-0 h-full w-full bg-black/50"></div>

          {/* Parallax image container with responsive image */}
          <div className="absolute z-1 inset-0 h-[150vh] w-full -top-[10%]">
            <picture>
              {/* Mobile */}
              {mainImage?.mobile && (
                <source 
                  media="(max-width: 768px)" 
                  srcSet={mainImage.mobile}
                />
              )}
              {/* Tablet */}
              {mainImage?.tablet && (
                <source 
                  media="(min-width: 769px) and (max-width: 1024px)" 
                  srcSet={mainImage.tablet}
                />
              )}
              {/* Desktop/Laptop */}
              {mainImage?.laptop && (
                <source 
                  media="(min-width: 1025px)" 
                  srcSet={mainImage.laptop}
                />
              )}
              <img
                ref={imageRef}
                className="will-change-transform w-full h-full object-cover"
                src={currentImage}
                alt={currentAlt}
              />
            </picture>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BannerHomepage;