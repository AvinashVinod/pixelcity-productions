import { useGSAP } from '@gsap/react';
import gsap from "gsap";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useRef, useState } from 'react';
import ButtonRevealingEffect from '../partials/ButtonRevealingEffect';
import LineRevealingEffect from '../partials/LineRevealingEffect';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const FALLBACK_DESC = "Every wedding is a unique manuscript. Step into our world to see how we transform your most personal moments into a high-end cinematic experience that stays with you forever.";

// Ask Sanity's CDN for a sized, compressed copy (Sanity URLs only)
const sanitySized = (url, width = 2000) =>
    url?.includes("cdn.sanity.io") ? `${url}?w=${width}&auto=format&q=80` : url;

const AboutHomepage = ({ description, imageUrl, imageAlt }) => {
    const aboutHomepageRef = useRef(null);
    const imageRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    const src = sanitySized(imageUrl);

    useGSAP(() => {
        // Runs again once imageUrl arrives and the <img> exists
        if (!imageRef.current) return;

        gsap.to(imageRef.current, {
            y: "20%",
            scale: 1.2,
            ease: "none",
            scrollTrigger: {
                trigger: aboutHomepageRef.current,
                start: "top 100%",
                scrub: true,
                invalidateOnRefresh: true,
            },
        });

        ScrollTrigger.refresh();
    }, { scope: aboutHomepageRef, dependencies: [src], revertOnUpdate: true });

    return (
        <div ref={aboutHomepageRef} className='grid place-items-center h-full w-full bg-white'>
            <div className="max-width w-full">
                <div className="relative pt-15 md:pt-0">
                    <p className='small-para absolute inset-0 uppercase font-semibold'>about us</p>
                    <LineRevealingEffect
                        tag="h1"
                        className="text-black font-light opacity-90 capitalize text-4xl md:text-6xl [word-spacing:-0.9rem] mb-15 md:mb-20"
                        direction="up"
                        withBlur={true}
                        withRotation={true}
                        stagger={0.15}
                        duration={0.8}
                        start="top 80%"
                        markers={false}
                    >
                        <span className='block md:hidden'>Go behind the lens of our cinematic Storycraft.</span>
                        <span className="ml-32 md:block hidden whitespace-nowrap">Go behind the lens of </span>
                        <span className='md:block hidden whitespace-nowrap'>our cinematic Storycraft.</span>
                    </LineRevealingEffect>
                </div>

                {/* Box keeps its height even before the image arrives — layout never jumps */}
                <div className="relative h-[70vh] md:h-[80vh] bg-black overflow-hidden mb-15 md:mb-10">
                    <div className="absolute z-1 inset-0 h-[120%] w-full -top-[10%]">
                        {src && (
                            <img
                                key={src}
                                ref={imageRef}
                                className={`will-change-transform w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                                src={src}
                                alt={imageAlt || "Pixel City Productions team at a wedding"}
                                loading="lazy"
                                decoding="async"
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageLoaded(true)}
                            />
                        )}
                    </div>
                </div>

                <div className="w-full lg:w-[48%] ml-auto">
                    <p className='secondary-heading leading-[38px] mb-15 md:mb-10'>
                        {description || FALLBACK_DESC}
                    </p>
                    <Link to="/about">
                        <div className='group border border-black text-black hover:text-white hover:bg-black w-fit px-10 py-3 mx-auto md:mx-0 transition-all duration-500 rounded-full cursor-pointer pointer-events-auto'>
                            <ButtonRevealingEffect text="Our Story" />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AboutHomepage;