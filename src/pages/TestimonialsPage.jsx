import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { client } from '../utils/client'; // Adjust path to your sanity client

// icons
import { MdOutlineStarPurple500 } from "react-icons/md";

// Helper function to optimize Sanity images
const getOptimizedImageUrl = (imageUrl, width = 400, quality = 80) => {
  if (!imageUrl) return '';
  if (imageUrl.includes('cdn.sanity.io')) {
    return `${imageUrl}?auto=format&q=${quality}&w=${width}&fit=crop`;
  }
  return imageUrl;
}

const TestimonialsPage = () => {
  const testimonialsRef = useRef(null);
  const coupleImageRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ========== FETCH TESTIMONIALS FROM SANITY ==========
  useEffect(() => {
    client
      .fetch(
        `*[_type == "testimonial"] | order(featured desc, date desc) {
          _id,
          coupleName,
          "imageUrl": image.asset->url,
          "imageAlt": image.alt,
          review,
          rating,
          date,
          featured
        }`,
      )
      .then((data) => {        
        if (data && data.length > 0) {
          setTestimonials(data);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching testimonials:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  // 1. Dynamic path generation for memojis
  const memojis = [];
  for (let i = 1; i <= 4; i++) {
    memojis.push(`/images/memoji/${i}.png`);
  }

  // 2. Define 4 unique premium pastel background colors for the avatars
  const bgColors = [
    '#E2F4C5', // Light Sage/Lime
    '#D3C5F4', // Soft Lavender
    '#C5F4E0', // Pale Mint
    '#F4C5D3'  // Pastel Rose/Pink
  ];
  
  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  
  // Animation function for couple image change
  const animateImageChange = (newIndex) => {
    const tl = gsap.timeline();
    
    // Animate only the couple image
    tl.to(coupleImageRef.current, {
      duration: 0.4,
      scale: 0.8,
      opacity: 0,
      rotation: -10,
      ease: "back.in(1)"
    })
    .call(() => {
      setCurrentIndex(newIndex);
    })
    .to(coupleImageRef.current, {
      duration: 0.5,
      scale: 1,
      opacity: 1,
      rotation: 0,
      ease: "elastic.out(1, 0.6)"
    });
    
    return tl;
  };
  
  // Auto-rotate testimonials (only if testimonials exist)
  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % testimonials.length;
      animateImageChange(nextIndex);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [currentIndex, testimonials.length]);
  
  // Initial animation for the whole section
  useEffect(() => {
    gsap.set(testimonialsRef.current, {
      y: 50,
      opacity: 0
    });

    gsap.to(testimonialsRef.current, {
      duration: 1,
      y: 0,
      opacity: 1,
      ease: "power2.out"
    });
  }, []);
  
  // Helper function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`text-2xl transition-all duration-300 ${
            i <= rating ? 'text-yellow-500' : 'text-black'
          }`}
        >
          <MdOutlineStarPurple500 />
        </span>
      );
    }
    return stars;
  };
  
  // Loading state
  if (loading) {
    return (
      <section className="min-h-dvh bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading testimonials...</p>
        </div>
      </section>
    );
  }
  
  // Error state
  if (error) {
    return (
      <section className="min-h-dvh bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error loading testimonials: {error.message}</p>
        </div>
      </section>
    );
  }
  
  // No testimonials state
  if (testimonials.length === 0) {
    return (
      <section className="min-h-dvh bg-white text-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No testimonials found. Please add testimonials in Sanity Studio.</p>
        </div>
      </section>
    );
  }
  
  const currentTestimonial = testimonials[currentIndex];
  const optimizedImageUrl = getOptimizedImageUrl(currentTestimonial.imageUrl, 400, 85);
  
  return (
    <section ref={testimonialsRef} className="min-h-dvh bg-white text-black">
      <div className="flex flex-col gap-10 max-width mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
          <h1 className="basis-[80%] mb-15 md:mb-6 leading-none text-center md:text-left">Trusted by Happy Couples</h1>
          <div className="relative basis-[20%] grow aspect-square h-70 w-70 md:h-60 md:w-60">
            <div className="relative h-full w-full z-1 rotate-12 rounded-lg overflow-hidden">
              <img 
                ref={coupleImageRef}
                src={optimizedImageUrl} 
                alt={currentTestimonial.imageAlt || "Happy couple"} 
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
            <div className="absolute inset-0 bg-black -rotate-6 rounded-lg overflow-hidden h-70 w-70 md:h-60 md:w-60">
              <img src="/images/bg.jpg" alt="testimonials-bg-img" />
            </div>
            {/* paperclip svg */}
            <div className="absolute z-10 rotate-12"
              style={{ 
    height: '100px', 
    width: 'auto',
    inset: '-22px 0px auto auto'
  }}
            >
              <svg width="100%" height="100%" viewBox="0 0 169 504" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 200.509C7 200.509 7 102.974 7 72.3002C7 41.6266 49.3717 7 85 7C130.808 6.99968 160.084 42.6606 161.259 72.3002C162.433 101.94 162.042 408.676 161.259 440.383C160.476 472.091 124.364 496.5 95 496.5C61.3293 496.5 26.576 468.989 26.576 440.383C26.576 411.777 26.576 128.646 26.576 128.646" stroke="#B79728" stroke-width="14" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="md:flex gap-10">
          <div className="md:basis-[20%] flex flex-col items-end">
            
            {/* Memoji avatars */}
            <div className="testimonials-memoji-img hidden md:flex items-center -space-x-4 w-full">
              {memojis.map((src, index) => (
                <div 
                  key={index} 
                  className="h-16 w-16 rounded-full border-4 border-white overflow-hidden shadow-md"
                  style={{ backgroundColor: bgColors[index % bgColors.length] }}
                >
                  <img 
                    src={src} 
                    alt={`User Memoji ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* ratings - dynamic based on current testimonial */}
            <div className="flex justify-center w-full mt-5 mb-5">
              {renderStars(currentTestimonial.rating)}
            </div>

            <div className="h-40 w-40 hidden md:block">
              <svg width="100%" height="100%" viewBox="0 0 513 415" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.50443 0.273438C-9.49742 118.273 106.004 259.773 218.004 162.773C280.737 108.443 271.004 83.0129 258.504 71.7734C199.004 18.2734 188.665 162.773 199.004 231.273C209.344 299.773 222.649 373.332 293.004 404.773C375.897 441.818 509.004 318.773 509.004 318.773M486.504 318.773H509.004L504.504 342.273" stroke="black" stroke-width="5"/>
              </svg>
            </div>
          </div>
          <div className="flex flex-col justify-between md:basis-[80%] ">
            <div className="w-full md:h-[60%] mb-10 text-center md:text-left">
              <p>{currentTestimonial.review}</p>
            </div>
            <div className="text-center md:text-left">
              <h3 className='h2 text-[1.8rem] lg:text-[3rem] leading-tight text-box-trim mb-5'>{currentTestimonial.coupleName}</h3>
              <p>{formatDate(currentTestimonial.date)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsPage;