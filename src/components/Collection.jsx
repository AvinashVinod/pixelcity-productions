import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LineRevealingEffect from '../partials/LineRevealingEffect';
import { Link } from 'react-router-dom';

// icons
import { MdArrowOutward } from "react-icons/md";

gsap.registerPlugin(ScrollTrigger);

const Collection = ({ items = [] }) => {
    const containerRef  = useRef(null);
    const itemsRef      = useRef([]);
    const mobileItemsRef = useRef([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') return window.innerWidth < 768;
        return false;
    });

    console.log(items);

    const addToRefs = (el) => {
        if (el && !itemsRef.current.includes(el)) itemsRef.current.push(el);
    };
    const addToMobileRefs = (el) => {
        if (el && !mobileItemsRef.current.includes(el)) mobileItemsRef.current.push(el);
    };

    const collectionItems = items
        .filter(item => item.imageUrl)
        .map((item, index) => ({
            id:    index,
            title: item.heading || `Collection ${index + 1}`,
            image: item.imageUrl,
            alt:   item.alt || item.heading || 'Collection image',
            order: item.order,
            url:   item.url,
        }));

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        // Clear stale refs when items swap (fallback → real Sanity data)
        itemsRef.current      = [];
        mobileItemsRef.current = [];
    }, [items]);

    // Mobile scroll reveal
    useGSAP(() => {
        if (!isMobile || !mobileItemsRef.current.length) return;

        const mobileItems = mobileItemsRef.current;
        gsap.set(mobileItems, { y: 50, opacity: 0 });

        mobileItems.forEach((item, index) => {
            gsap.to(item, {
                y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
                delay: index * 0.15,
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    end:   'top 60%',
                }
            });
        });

        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, { scope: containerRef, dependencies: [isMobile, collectionItems.length] });

    // Desktop accordion
    useGSAP(() => {
        if (!containerRef.current || isMobile || !collectionItems.length) return;

        const els        = itemsRef.current;
        const total      = els.length;
        const gap        = 12;
        const cw         = containerRef.current.offsetWidth;
        const totalGap   = gap * (total - 1);
        const expandedPct = 70;
        const expandedPx  = (expandedPct / 100) * cw;
        const otherPct    = ((cw - expandedPx - totalGap) / (total - 1)) / cw * 100;

        els.forEach((el, i) => {
            gsap.set(el, {
                width: i === 0 ? `${expandedPct}%` : `${otherPct}%`,
                flex: '0 0 auto',
            });
        });

        const expand = (hoveredIndex) => {
            gsap.killTweensOf(els);
            const w     = containerRef.current.offsetWidth;
            const exPx  = (expandedPct / 100) * w;
            const rem   = w - exPx - totalGap;
            const other = (rem / (total - 1)) / w * 100;
            gsap.to(els[hoveredIndex], { width: `${expandedPct}%`, duration: 0.5, ease: 'power2.out' });
            els.forEach((el, i) => {
                if (i !== hoveredIndex) gsap.to(el, { width: `${other}%`, duration: 0.5, ease: 'power2.out' });
            });
            setActiveIndex(hoveredIndex);
        };

        const reset = () => {
            gsap.killTweensOf(els);
            const w     = containerRef.current.offsetWidth;
            const exPx  = (expandedPct / 100) * w;
            const rem   = w - exPx - totalGap;
            const other = (rem / (total - 1)) / w * 100;
            els.forEach((el, i) => {
                gsap.to(el, { width: i === 0 ? `${expandedPct}%` : `${other}%`, duration: 0.5, ease: 'power2.out' });
            });
            setActiveIndex(0);
        };

        els.forEach((el, i) => {
            const enter = () => expand(i);
            const leave = () => reset();
            el.addEventListener('mouseenter', enter);
            el.addEventListener('mouseleave', leave);
            el._handlers = { enter, leave };
        });

        const onResize = () => { if (!isMobile) reset(); };
        window.addEventListener('resize', onResize);

        return () => {
            els.forEach(el => {
                if (el._handlers) {
                    el.removeEventListener('mouseenter', el._handlers.enter);
                    el.removeEventListener('mouseleave', el._handlers.leave);
                }
            });
            window.removeEventListener('resize', onResize);
        };
    }, { scope: containerRef, dependencies: [isMobile, collectionItems.length] });

    return (
        <div className='grid place-items-center h-full w-full bg-[#E3E2DD]'>
            <div className="max-width w-full text-center px-4">
                <p className='small-para font-semibold mb-10'>the Collection</p>

                <LineRevealingEffect
                    tag="h1"
                    className="text-black font-light opacity-90 capitalize text-4xl md:text-6xl [word-spacing:-0.9rem] mb-15 md:mb-20"
                    direction="up" withBlur={true} withRotation={true}
                    stagger={0.15} duration={0.8} start="top 80%" markers={false}
                >
                    {isMobile
                        ? <>Your Story, <br /><span>Our Lens</span></>
                        : <>Stories worth<br /><span>remembering</span></>
                    }
                </LineRevealingEffect>

                {isMobile ? (
                    <div className="flex flex-col gap-4 w-full">
                        {collectionItems.map((item) => (
                            <Link
                                to={item.url}
                                key={item.id}
                                ref={addToMobileRefs}
                                className="relative w-full h-[380px] overflow-hidden cursor-pointer group will-change-transform"
                            >
                                <div
                                    className="absolute inset-0 transition-transform duration-350 group-hover:scale-110"
                                    style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-end pb-2 pl-3 transition-all duration-300 group-hover:bg-black/40">
                                    <div className="absolute grid place-items-center h-10 w-10 border-white/50 border-2 rounded-full top-5 right-5">
                                        <MdArrowOutward className='text-2xl text-white' />
                                    </div>
                                    <h2 className="text-white text-2xl font-light text-left">{item.title}</h2>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div ref={containerRef} className="flex gap-3 h-[70vh] md:h-[80vh] w-full overflow-hidden cursor-pointer">
                        {collectionItems.map((item, index) => (
                            <Link
                                to={item.url}
                                key={item.id}
                                ref={addToRefs}
                                className="relative h-full transition-shadow duration-300 hover:shadow-2xl overflow-hidden"
                                style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            >
                                <div className={`absolute inset-0 flex items-end pb-0 pl-5 transition-opacity duration-300 ${
                                    index === activeIndex ? 'bg-black/30 opacity-100' : 'bg-black/30 opacity-0 hover:opacity-100'
                                }`}>
                                    <div className="absolute grid place-items-center h-10 w-10 border-white/50 border-2 rounded-full top-5 right-5">
                                        <MdArrowOutward className='text-2xl text-white' />
                                    </div>
                                    <h2 className="h2 text-white text-[2rem] md:text-[4rem] font-light">{item.title}</h2>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Collection;