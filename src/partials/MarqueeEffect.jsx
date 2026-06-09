import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MarqueeEffect = () => {
  const marqueeRef = useRef(null);
  const itemsRef = useRef([]);

  const words = [
    "Cinematic Wedding Films",
    "Pre-Wedding Stories",
    "Editorial Photography",
    "Creative Direction",
    "Brand Identity"
  ];

  useGSAP(() => {
    // 1. Seamless Infinite Loop
    const loop = gsap.to(itemsRef.current, {
      xPercent: -100,
      repeat: -1,
      duration: 20,
      ease: "none",
    });

    // 2. Velocity-Based Skew and Speed
    ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        const skew = velocity / 200; // Adjust for intensity
        const timeScale = Math.abs(velocity / 500) + 1;

        // Apply skew to the container
        gsap.to(marqueeRef.current, {
          skewX: skew,
          duration: 0.5,
          ease: "power3.out",
        });

        // Adjust loop speed based on scroll velocity
        gsap.to(loop, {
          timeScale: timeScale,
          duration: 0.5,
        });
      },
    });
  }, { scope: marqueeRef });

  return (
    <section className="py-0 overflow-hidden bg-[#E3E2DD] border-y border-black/5">
      <div ref={marqueeRef} className="flex whitespace-nowrap will-change-transform">
        {/* Render twice for seamless loop */}
        {[...Array(2)].map((_, i) => (
          <div 
            key={i} 
            ref={(el) => (itemsRef.current[i] = el)} 
            className="flex items-center gap-12 px-6"
          >
            {words.map((word, idx) => (
              <React.Fragment key={idx}>
                <h2 className="h2 text-[12vw] sm:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.8rem] font-light text-black/80">
                  {word}
                </h2>
                <span className="text-[#CFA86D] text-[1.5rem] md:text-[3rem]">✦</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default MarqueeEffect;