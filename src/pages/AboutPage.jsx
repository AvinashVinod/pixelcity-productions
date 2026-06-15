import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import LineRevealingEffect from '../partials/LineRevealingEffect';
import { useGSAP } from '@gsap/react';
import FAQ from '../partials/FAQ';
import ButtonRevealingEffect from '../partials/ButtonRevealingEffect';
import { client } from '../utils/client';

const AboutPage = () => {
    const [about, setAbout] = useState(null);
    const [error, setError] = useState(null);
    const aboutRef = useRef(null);
    const imageRef = useRef();

    /* ---------------- FETCH DATA ---------------- */
    useEffect(() => {
        client
            .fetch(
                `*[_type == "about"][0] {
                    _id,
                    mainSectionDescription1,
                    mainSectionDescription2,
                    secondaryHeading,
                    secondSectionDescription1,
                    secondSectionDescription2,
                    secondSectionDescription3,
                    "mainImageUrl": mainImage.asset->url,
                    "mainImageAlt": mainImage.alt,
                    "secondaryImageUrl": secondaryImage.asset->url,
                    "secondaryImageAlt": secondaryImage.alt,
                    faqSection[] {
                        _key,
                        question,
                        answer
                    }
                }`,
            )
            .then((data) => {
                const cleanData = Array.isArray(data) ? data[0] : data;
                setAbout(cleanData);
            })
            .catch((err) => {
                setError(err);
            });
    }, []);
    
    useEffect(() => {
        // Set initial styles
        gsap.set(aboutRef.current, {
            y: 50,
            opacity: 0
        });

        gsap.to(aboutRef.current, {
            duration: 1,
            y: 0,
            opacity: 1,
            ease: "power2.out"
        });
    }, []);

    // --- Parallax Scroll Animation ---
    useGSAP(() => {
        gsap.to(imageRef.current, {
            y: "20%", 
            scale: 1.2,
            ease: "none",
            scrollTrigger: {
                trigger: imageRef.current,
                start: "top 100%",
                scrub: true, 
            }
        });
    }, { scope: aboutRef });
    
    return (
        <section ref={aboutRef} className='min-h-dvh h-full text-black bg-white pt-10'>
            <div className="max-width mx-auto">
                <p className='small-para text-center mb-5 font-semibold'>passionate about capturing your memories through my lens.</p>
                <h2 className='text-[28vw] sm:text-[10rem] lg:text-[14vw] h2 leading-[24vw] sm:leading-[8rem] lg:leading-[12vw] font-light opacity-90 uppercase text-center [word-spacing:-0.9rem] mb-15 md:mb-20'>About me</h2>
                <div className="grid md:grid-cols-2 gap-10 lg:h-dvh mb-20 md:mb-20">
                    <div className="overflow-hidden">
                        {/* Dynamic Main Image with Unsplash Fallback */}
                        <img 
                            src={about?.mainImageUrl || "https://images.unsplash.com/photo-1648692809415-59baa8dd27b9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                            alt={about?.mainImageAlt || "aboutPage-banner-img"} 
                        />
                    </div>
                    <div className="flex flex-col justify-between">
                        <div className="grid gap-5">
                            <p>{about?.mainSectionDescription1}</p>
                            <p>{about?.mainSectionDescription2}</p>
                        </div>
                        <a target='_blank' className='md:text-right block secondary-heading mt-5 md:mt-0 leading-[38px] underline' href="https://www.instagram.com/pixelcityjaipur/">@pixelcityjaipur</a>
                    </div>
                </div>
                
                <div className="lg:h-dvh mb-15 md:mb-20">
                    <div className="flex flex-col gap-5">
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
                            {about?.secondaryHeading || "I'll tell your story with honesty, style, and heart."}
                        </LineRevealingEffect>
                        <div className="grid gap-10">
                            <h5 className='text-[18px] lg:text-[30px] lg:leading-[38px]'>{about?.secondSectionDescription1}</h5>
                            <h5 className='text-[18px] lg:text-[30px] lg:leading-[38px]'>{about?.secondSectionDescription2}</h5>
                            <h5 className='text-[18px] lg:text-[30px] lg:leading-[38px]'>{about?.secondSectionDescription3}</h5>
                        </div>
                    </div>
                </div>

                {/* about wedding image */}
                <div className="relative h-[70vh] md:h-[80vh] bg-black overflow-hidden mb-15 md:mb-10">
                    <div className="absolute z-1 inset-0 h-[120%] w-full top-[-10%]">
                        {/* Dynamic Secondary Image with Unsplash Fallback */}
                        <img 
                            ref={imageRef} 
                            className='will-change-transform w-full h-full object-cover' 
                            src={about?.secondaryImageUrl || "https://images.unsplash.com/photo-1775126964899-ae7b573d77e9?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                            alt={about?.secondaryImageAlt || "homepage-about-image"} 
                        />
                    </div>
                </div>
            </div>
            
            <div className="bg-[#E3E2DD]">
                <div className="max-width mx-auto">
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
                        Have Questions?
                    </LineRevealingEffect>
                    <FAQ data={about?.faqSection} />
                </div>
            </div>
            
            <div className="flex flex-col justify-center items-center max-width mx-auto min-h-[80vh]">
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
                    Let’s Start the <br />
                    Conversation
                </LineRevealingEffect>
                <a href="" className='group inline-block border border-black text-black hover:text-white hover:bg-black px-10 py-3 transition-all duration-500 rounded-full cursor-pointer pointer-events-auto w-fit'>
                    <ButtonRevealingEffect text="submit inquiry" />
                </a>
            </div>
        </section>
    )
}

export default AboutPage;