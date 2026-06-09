import React, { useState, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null)
  const containerRef = useRef(null)
  const answerRefs = useRef([])
  const iconRefs = useRef([])

  const faqData = [
    {
      question: "What is your photography style?", 
      answer: "My photography blends editorial fashion aesthetics with candid moments and unique vibes. I capture refined cinematic compositions while embracing genuine unfiltered emotions. The result is a collection of images that feel effortless and elevated, timeless yet full of life."
    },
    {
      question: "How far in advance should we book you?",
      answer: "I take on a limited number of weddings each year to give every couple the attention they deserve. For peak seasons (spring, summer, and fall), I recommend booking 12 months in advance. However, last-minute inquiries are always welcome if my schedule allows."
    },
    {
      question: "Do you travel for destination weddings?",
      answer: "Yes, my work focuses on Italy's most iconic wedding locations such as Lake Como, Tuscany, Amalfi Coast, and Puglia. I am also available for weddings worldwide. I usually arrive a day early to explore the location, understand the lighting, and make sure we capture the best possible moments."
    },
    {
      question: "What is your booking process?",
      answer: "To reserve your date, I require a signed contract and a 50% retainer. The final balance is due three weeks before your wedding. Since I take on a limited number of weddings, I encourage booking early to secure your date."
    },
    {
      question: "Do you offer engagement or pre-wedding sessions?",
      answer: "Absolutely! Engagement and pre-wedding sessions are a wonderful way to get comfortable in front of the camera before your wedding day. These sessions have a relaxed editorial feel that creates stylish and personal images reflecting your unique love story. For couples celebrating over multiple days, I offer tailored coverage to capture the full journey from intimate moments to grand celebrations ensuring every part of your story is beautifully documented."
    },
  ]

  // --- NEW: ScrollTrigger Reveal Animation ---
  useGSAP(() => {
    const cards = gsap.utils.toArray('.faq-card');
    
    gsap.fromTo(cards, 
      { 
        opacity: 0, 
        y: 50 
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.2, // Time between each item reveal
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%", // Starts when the top of FAQ is 85% down the viewport
          toggleActions: "play none none none"
        }
      }
    );
  }, { scope: containerRef });

  // --- Existing Logic for Click Interactions ---
  const handleClick = (index) => {
    if (activeIndex === index) {
      gsap.to(iconRefs.current[index], { rotate: 0, duration: 0.3, ease: "power2.inOut" })
      gsap.to(answerRefs.current[index], { height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut", onComplete: () => setActiveIndex(null) })
    } else {
      if (activeIndex !== null) {
        gsap.to(iconRefs.current[activeIndex], { rotate: 0, duration: 0.3, ease: "power2.inOut" })
        gsap.to(answerRefs.current[activeIndex], { height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut" })
      }
      setActiveIndex(index)
      const answerContent = answerRefs.current[index]
      if (answerContent) {
        const contentHeight = answerContent.scrollHeight
        gsap.to(iconRefs.current[index], { rotate: 45, duration: 0.3, ease: "power2.inOut" })
        gsap.to(answerContent, {
          height: contentHeight,
          opacity: 1,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => { answerContent.style.height = "auto" }
        })
      }
    }
  }

  useGSAP(() => {
    answerRefs.current.forEach((ref) => { if (ref) gsap.set(ref, { height: 0, opacity: 0, overflow: "hidden" }) })
    iconRefs.current.forEach((ref) => { if (ref) gsap.set(ref, { rotate: 0 }) })
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className='flex flex-col gap-2'>
      {faqData.map((el, id) => (
        // Added 'faq-card' class for the stagger selector
        <div key={id} className='faq-card bg-white rounded-md overflow-hidden pl-4 pr-4'>
          <div 
            className='grid grid-cols-[5%_auto_2.5rem] gap-5 cursor-pointer items-start py-6'
            onClick={() => handleClick(id)}
          >
            {/* Question number */}
            <div className='h2 text-[1.5rem] lg:text-[2rem] leading-none opacity-50 text-center'>
              {String(id + 1).padStart(2, '0')}
            </div>
            
            {/* Question text */}
            <div className='flex flex-col'>
              <h3 className='h2 text-[1.8rem] lg:text-[3rem] leading-tight text-box-trim'>
                {el.question}
              </h3>
              
              <div ref={el => answerRefs.current[id] = el} className="overflow-hidden">
                <p className="w-full lg:w-[80%] pt-6 pb-3 text-lg lg:text-xl opacity-80 leading-relaxed">
                  {el.answer}
                </p>
              </div>
            </div>
            
            {/* Plus Icon */}
            <div className="relative h-10 w-10">
              <div ref={el => iconRefs.current[id] = el} className='absolute inset-0 text-[2rem] leading-none flex justify-center'>
                +
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FAQ