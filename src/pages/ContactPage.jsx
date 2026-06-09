import React, { useEffect, useRef } from 'react';
import gsap from 'gsap'
import CustomDatePicker from '../partials/CustomDatePicker';

const ContactPage = () => {
    const contactRef = useRef(null);

    useEffect(() => {
      // Set initial styles
      gsap.set(contactRef.current, {
          y: 50,
          opacity: 0
      });

      gsap.to(contactRef.current, {
          duration: 1,
          y: 0,
          opacity: 1,
          ease: "power2.out"
      });
  }, []);

  return (
    <section ref={contactRef} className="relative h-full bg-white text-black">
      <div className="absolute z-0 right-0 top-[4.6vh] md:-top-[4rem] h-[40vh] md:h-90 -rotate-[50deg]"><img src="/images/flower.png" alt="contact-page-flower-bg" /></div>
      <div className="relative z-1 max-width mx-auto">
        <h1 className="mb-15 md:mb-20 leading-none">Let's Plan Your Shoot</h1>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="bg-black h-[50vh] md:h-auto">
            <img src="/images/monochrome/prewedding/9.jpg" alt="enquire-form-img" />
          </div>
          <div className="flex justify-center items-center">
            <CustomDatePicker />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
