import React, { useRef, useEffect, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useLocation } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const Footer = () => {
    const { pathname, key } = useLocation();
    const footerRef = useRef(null);
    const circleRef = useRef(null);
    const keyRef    = useRef(key);

    useEffect(() => { keyRef.current = key; }, [key]);

    const createAnimation = useCallback(() => {
        const circle = circleRef.current;
        const footer = footerRef.current;
        if (!circle || !footer) return;

        ScrollTrigger.getAll()
            .filter(st => st.vars.id?.startsWith('footer-reveal'))
            .forEach(st => st.kill());

        gsap.set(circle, { clipPath: 'circle(100% at bottom)' });

        const tl = gsap.timeline({
            scrollTrigger: {
                id: `footer-reveal-${keyRef.current}`,
                trigger: footer,
                start: 'top 95%',
                end: 'top 5%',
                scrub: 2,
                invalidateOnRefresh: true,
            }
        });

        tl.fromTo(circle,
            { clipPath: 'circle(100% at bottom)' },
            { clipPath: 'circle(0% at bottom)', duration: 0.8, ease: 'power2.out' }
        );

        requestAnimationFrame(() => ScrollTrigger.refresh());
    }, []);

    useGSAP(() => {
        const isAsyncPage = pathname.includes('/wedding/') || pathname.includes('/pre-wedding/');

        if (pathname === '/') {
            const timer = setTimeout(createAnimation, 5200);
            return () => clearTimeout(timer);
        } else if (!isAsyncPage) {
            const timer = setTimeout(createAnimation, 400);
            return () => clearTimeout(timer);
        }
        // async detail pages: wait for page-content-ready
    }, { dependencies: [pathname, key], scope: footerRef });

    useEffect(() => {
        const handleContentReady = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    createAnimation();
                });
            });
        };

        window.addEventListener('page-content-ready', handleContentReady);
        return () => window.removeEventListener('page-content-ready', handleContentReady);
    }, [pathname, createAnimation]);

    return (
        <div ref={footerRef} className='relative z-30 h-full lg:h-[90vh] w-full px-[1rem] sm:px-[2rem] pb-10 lg:pb-20 text-white bg-white'>
            <div className="relative bg-black rounded-[2rem] lg:rounded-[7rem] h-full w-full overflow-hidden pt-2 lg:pt-15 sm:px-10 lg:px-15 xl:px-23.5 px-2">
                <div
                    ref={circleRef}
                    className="absolute z-50 bottom-0 left-1/2 -translate-x-1/2 h-[200vh] w-[200vh] bg-white/95"
                    style={{ clipPath: 'circle(100% at bottom)' }}
                ></div>
                <div className="relative z-20 flex flex-col lg:flex-row justify-center gap-20 h-full lg:h-40 w-full pt-5 pb-10 px-5 lg:pt-2 lg:pb-2 lg:px-2">
                    <h1 className='text-box-trim w-[95%] lg:w-[50%] leading-none'>Preserving the fleeting, framing the forever.</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
                        <div>
                            <p className='text-box-trim mb-4'>Explore</p>
                            <ul className='flex flex-col gap-1'>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><Link to="/about">About us</Link></li>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><Link to="/wedding">Wedding</Link></li>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><Link to="/pre-wedding">Pre-Wedding</Link></li>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><Link to="/testimonials">Testimonials</Link></li>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <p className='text-box-trim mb-4'>Socials</p>
                            <ul className='flex flex-col gap-1'>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><a href="#instagram">Instagram</a></li>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><a href="#facebook">Facebook</a></li>
                                <li className='opacity-40 hover:opacity-100 transition-opacity duration-500'><a href="#youtube">Youtube</a></li>
                            </ul>
                        </div>
                        <div>
                            <p className='text-box-trim mb-4'>Contact us</p>
                            <a href="mailto:pixalsquare@gmail.com">pixalsquare@gmail.com</a>
                        </div>
                    </div>
                </div>
                <div className="absolute z-0 bottom-[-0.5rem] right-[-20%] sm:right-[-10%] lg:top-1/2 lg:-translate-y-1/2 lg:right-[-10%] text-center w-[20rem] sm:w-[45vw] lg:w-[35vw] lg:h-[35vw] opacity-40">
                    <img src="/images/logo-white.png" alt="footer-logo" />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between lg:items-center sm:gap-10 text-black lg:px-23.5 capitalize mt-5">
                <p className='w-[90%] lg:w-fit leading-[1.5rem]'>Copyright &copy; 2016 Pixel City Productions. All right reserved.</p>
                <div className="flex gap-10 w-full lg:w-fit mt-5 lg:mt-0">
                    <a className='underline' href="#privacy">Privacy Policy</a>
                    <a className='underline' href="#terms">Terms of Service</a>
                </div>
            </div>
        </div>
    );
};

export default Footer;