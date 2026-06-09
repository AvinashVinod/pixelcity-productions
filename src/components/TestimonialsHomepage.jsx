import React, { useState, useEffect } from "react";

import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import LineRevealingEffect from "../partials/LineRevealingEffect";

const FALLBACK_TESTIMONIALS = [
  {
    text: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsa voluptatem est labore similique laudantium nemo consectetur adipisci repudiandae fuga optio, soluta consequatur suscipit vel magni dolore dolorum ab incidunt dolores!",
    name: "Riya Sharma",
    role: "Married in Jaipur, 2025",
  },
  {
    text: "Absolutely phenomenal work! The website exceeded our expectations. The team was professional, responsive, and delivered ahead of schedule. Highly recommend for anyone needing custom development.",
    name: "Amit Patel",
    role: "CEO, TechStart India",
  },
  {
    text: "Best decision we made for our business. The scalable solution they built handles our growing traffic effortlessly. Premium quality and attention to detail throughout the process.",
    name: "Neha Verma",
    role: "Founder, CreativeHub",
  },
];

const formatRole = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `Married in ${d.toLocaleString("default", { month: "long" })}, ${d.getFullYear()}`;
};

const TestimonialsHomepage = ({ testimonials = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = testimonials.length > 0
    ? testimonials.slice(0, 3).map((t) => ({
        text: t.review,
        name: t.coupleName,
        role: formatRole(t.date),
      }))
    : FALLBACK_TESTIMONIALS;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [testimonials]);

  const handleDotClick = (index) => setActiveIndex(index);

  return (
    <div className="grid place-items-center h-full w-full bg-[#E3E2DD] overflow-hidden">
      <div className="max-width w-full text-center px-4">
        <LineRevealingEffect
          tag="h1"
          className="text-black font-light opacity-90 capitalize text-4xl md:text-6xl [word-spacing:-0.9rem] mb-20"
          direction="up"
          withBlur={true}
          withRotation={true}
          stagger={0.15}
          duration={0.8}
          start="top 80%"
          markers={false}
        >
          Apparently, I'm fun <br /> <span>to work with!</span>
        </LineRevealingEffect>

        <div className="relative flex h-fit w-full">
          {/* mobile double quote */}
          <div className="absolute left-[-10rem] top-[-32rem] md:basis-[30%] opacity-10 md:hidden">
            <div className="text-[33rem] mx-auto w-fit">
              <RiDoubleQuotesL />
            </div>
          </div>

          {/* Left Quote */}
          <div className="md:basis-[30%] md:block hidden">
            <div className="relative -top-7 text-[12rem] mx-auto w-fit">
              <RiDoubleQuotesL />
            </div>
          </div>

          {/* Sliding Testimonial Content */}
          <div className="md:basis-[40%] flex flex-col justify-center gap-10 text-left overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {items.map((testimonial, idx) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 flex flex-col justify-between gap-10"
                >
                  <div className="h-full text-center md:text-left line-clamp-5">
                    <p className="break-words whitespace-normal overflow-wrap-anywhere hyphens-auto">{testimonial.text}</p>
                  </div>
                  <div className="h-[20%] text-center md:text-left">
                    <p className="leading-none font-semibold">
                      {testimonial.name}
                    </p>
                    <p className="small-para text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Quote */}
          <div className="md:basis-[30%] md:block hidden">
            <div className="text-[12rem] mx-auto w-fit">
              <RiDoubleQuotesR />
            </div>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="homepage-testimonials-dots__container flex justify-center gap-1.5 mt-10">
          {items.map((_, idx) => (
            <div
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`cursor-pointer h-[0.15rem] transition-all duration-300 ${
                activeIndex === idx ? "w-13 bg-[#CFA86D]" : "w-6 bg-black"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsHomepage;