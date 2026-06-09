import { useGSAP } from "@gsap/react";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Link, useLocation } from "react-router-dom";
import ButtonRevealingEffect from "./ButtonRevealingEffect";

// icons
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { TfiYoutube } from "react-icons/tfi";

const Navbar = ({ introKey = "static", isHomeRoute = false }) => {
  const { pathname } = useLocation();
  const navbarRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const layer3Ref = useRef(null);
  const menuContainerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  const handleClick = () => {
    setIsRotated((prev) => !prev);
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setIsRotated(false);
  };

  // Handle click outside functionality
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if menu is open and click is outside the menu container and outside the menu button
      if (
        isOpen && 
        menuContainerRef.current && 
        !menuContainerRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    // Add event listener when menu is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      closeMenu();
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  // Initial entrance animation for the Navbar
  useGSAP(
    () => {
      if (!navbarRef.current) return;

      gsap.killTweensOf(navbarRef.current);

      if (!isHomeRoute) {
        gsap.set(navbarRef.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.set(navbarRef.current, { opacity: 0, y: "-100px" });
      gsap.to(navbarRef.current, {
        opacity: 1,
        y: 0,
        delay: 5.6,
        duration: 0.9,
        ease: "ease.out",
      });
    },
    { scope: navbarRef, dependencies: [introKey, isHomeRoute] },
  );

  // Premium GSAP animation for layered divs
  useGSAP(() => {
    if (!layer1Ref.current || !layer2Ref.current || !layer3Ref.current) return;

    // Kill any existing animations
    gsap.killTweensOf([
      layer1Ref.current,
      layer2Ref.current,
      layer3Ref.current,
    ]);

    if (isOpen) {
      // Reset positions to initial state (offscreen)
      gsap.set([layer1Ref.current, layer2Ref.current, layer3Ref.current], {
        x: "100%",
      });

      // Layer 1 (z-1) - Fastest, most energetic
      gsap.to(layer1Ref.current, {
        x: "0%",
        duration: 0.8,
        ease: "expo.out",
        delay: 0,
      });

      // Layer 2 (z-2) - Medium speed with slight delay
      gsap.to(layer2Ref.current, {
        x: "0%",
        duration: 0.8,
        ease: "expo.out",
        delay: 0.1,
      });

      // Layer 3 (z-3) - Slowest, smoothest, with larger delay for premium feel
      gsap.to(layer3Ref.current, {
        x: "0%",
        duration: 0.8,
        ease: "expo.out",
        delay: 0.2,
      });
    } else {
      // Closing animation - send them back with different speeds
      // Layer 1 - Fastest exit
      gsap.to(layer1Ref.current, {
        x: "100%",
        duration: 0.5,
        ease: "power2.in",
        delay: 0,
      });

      // Layer 2 - Medium exit
      gsap.to(layer2Ref.current, {
        x: "100%",
        duration: 0.6,
        ease: "power2.in",
        delay: 0.05,
      });

      // Layer 3 - Slowest exit
      gsap.to(layer3Ref.current, {
        x: "100%",
        duration: 0.7,
        ease: "power2.in",
        delay: 0.1,
      });
    }
  }, [isOpen]);

  return (
    <nav
      ref={navbarRef}
      className={`fixed inset-0 z-100 w-full text-white ${isRotated ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* Premium Layered Divs with GSAP animations */}
      <div 
        className={`fixed z-1 h-full w-full bg-black transition-opacity duration-300 ${isRotated ? "opacity-70 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeMenu}
      ></div>
      <div
        ref={layer1Ref}
        className="absolute z-1 right-0 top-0 h-full w-[85%] sm:w-[60%] md:w-[50%] lg:w-[35%] xl:w-[30%] bg-white rounded-bl-md rounded-tl-md"
        style={{ transform: "translateX(100%)" }}
      ></div>
      <div
        ref={layer2Ref}
        className="absolute z-2 right-0 top-0 h-full w-[85%] sm:w-[60%] md:w-[50%] lg:w-[35%] xl:w-[30%] bg-black rounded-bl-md rounded-tl-md"
        style={{ transform: "translateX(100%)" }}
      ></div>
      <div
        ref={(el) => {
          layer3Ref.current = el;
          menuContainerRef.current = el;
        }}
        className="absolute z-3 right-0 top-0 flex flex-col justify-between h-full w-[85%] sm:w-[60%] md:w-[50%] lg:w-[35%] xl:w-[30%] bg-white rounded-bl-md rounded-tl-md text-black pt-20 pb-5 pointer-events-auto"
        style={{ transform: "translateX(100%)" }}
      >
        <div className="">
            <ul className="mb-10">
              <li className="h2">
                <Link to="/about" onClick={closeMenu}>
                  <ButtonRevealingEffect
                    text="About me"
                    className="text-[12vw] sm:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.8rem] leading-[15vw] sm:leading-[5rem] lg:leading-[4rem] xl:leading-[4.8rem]"
                    padding="pl-7"
                    idx="1"
                  />
                </Link>
              </li>
              <li className="h2">
                <Link to="/films" onClick={closeMenu}>
                  <ButtonRevealingEffect
                    text="Films"
                    className="text-[12vw] sm:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.8rem] leading-[15vw] sm:leading-[5rem] lg:leading-[4rem] xl:leading-[4.8rem]"
                    padding="pl-7"
                    idx="2"
                  />
                </Link>
              </li>
              <li className="h2">
                <Link to="/wedding" onClick={closeMenu}>
                  <ButtonRevealingEffect
                    text="Wedding"
                    className="text-[12vw] sm:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.8rem] leading-[15vw] sm:leading-[5rem] lg:leading-[4rem] xl:leading-[4.8rem]"
                    padding="pl-7"
                    idx="3"
                  />
                </Link>
              </li>
              <li className="h2">
                <Link to="/pre-wedding" onClick={closeMenu}>
                  <ButtonRevealingEffect
                    text="Pre-Wedding"
                    className="text-[12vw] sm:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.8rem] leading-[15vw] sm:leading-[5rem] lg:leading-[4rem] xl:leading-[4.8rem]"
                    padding="pl-7"
                    idx="4"
                  />
                </Link>
              </li>
              <li className="h2">
                <Link to="/monochrome" onClick={closeMenu}>
                  <ButtonRevealingEffect
                    text="Monochrome"
                    className="text-[12vw] sm:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.8rem] leading-[15vw] sm:leading-[5rem] lg:leading-[4rem] xl:leading-[4.8rem]"
                    padding="pl-7"
                    idx="5"
                  />
                </Link>
              </li>
              <li className="h2">
                <Link to="/testimonials" onClick={closeMenu}>
                  <ButtonRevealingEffect
                    text="Testimonials"
                    className="text-[12vw] sm:text-[3.7rem] lg:text-[2.9rem] xl:text-[3.8rem] leading-[15vw] sm:leading-[5rem] lg:leading-[4rem] xl:leading-[4.8rem]"
                    padding="pl-7"
                    idx="6"
                  />
                </Link>
              </li>
            </ul>
            <div className="grid place-items-center">
                <Link
                  to="/contact"
                  onClick={closeMenu}
                  className='group border border-black text-black hover:text-white hover:bg-black w-fit px-10 py-3 mx-auto transition-all duration-500 rounded-full cursor-pointer pointer-events-auto'
                >
                  <ButtonRevealingEffect text="Enquire" />
                </Link>
            </div>
        </div>
        <div className="h-fit w-full pl-7">
            <p className="capitalize mb-2">follow</p>
            <div className="flex gap-3">
                <a href="https://www.instagram.com/pixelcityproductions/" target="_blank" className="text-[2rem] cursor-pointer"><FaInstagram /></a>
                <a href="https://www.instagram.com/pixelcityproductions/" target="_blank" className="text-[2rem] cursor-pointer"><FaFacebook /></a>
                <a href="https://www.youtube.com/@pixelcityproductions" target="_blank" className="text-[2rem] cursor-pointer"><TfiYoutube /></a>
            </div>
        </div>
      </div>

      <div className="relative h-fit">
        <div className="px-4 sm:px-[1.57rem] relative flex items-center justify-between gap-2 h-22">
          <div className="h-14 w-14 pointer-events-auto z-20 relative">
            <Link to="/" onClick={closeMenu}>
              <img src="/images/pcp_logo.png" alt="Logo" />
            </Link>
          </div>
          <div
            ref={menuButtonRef}
            className="group relative z-20 flex items-center gap-2 cursor-pointer pointer-events-auto"
            onClick={handleClick}
          >
            <p className="text-box-trim small-para text-black">Menu</p>
            <div className="p-4 h-8.5 w-8.5 bg-black backdrop-blur-xl rounded-full pointer-events-auto">
              <div
                className={`
                                absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                transition-transform duration-500 flex flex-col gap-[0.15rem]
                                ${isRotated ? "rotate-90" : "rotate-0"}
                            `}
              >
                <div className="h-[0.10rem] w-[1.2rem] bg-white"></div>
                <div className="h-[0.10rem] w-[1.2rem] bg-white"></div>
                <div className="h-[0.10rem] w-[1.2rem] bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;