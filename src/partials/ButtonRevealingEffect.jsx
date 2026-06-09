import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ButtonRevealingEffect = ({ text, className, padding, idx }) => {
  const textRef = useRef(null);
  const textRef2 = useRef(null);

  useGSAP(() => {}, { scope: textRef });

  return (
    <div className={`relative group cursor-pointer overflow-hidden ${className || 'font-semibold'}`}>
      <div className="relative w-fit">
        <h2
          ref={textRef}
          className={`${idx ? '' : 'small-para'} transition-all duration-300 group-active:-translate-y-full group-hover:-translate-y-full ${padding}`}
        >
          {text}
        </h2>
        <span className="absolute top-[-2.8vw] sm:top-[-0.87rem] lg:top-[-0.57rem] xl:top-[-0.91rem] right-[-6%] z-20 text-[1.2rem] text-black group-active:text-white group-hover:text-white transition-all duration-300 whitespace-nowrap">
          {idx}
        </span>
      </div>
      <h2
        ref={textRef2}
        className={`absolute ${idx ? 'bg-black' : 'small-para'} text-white w-full transition-all duration-300 translate-y-full group-active:translate-y-0 group-hover:translate-y-0 top-0 left-0 ${padding}`}
      >
        {text}
        {/* <span className="text-[1.2rem] text-white ml-1">{idx}</span> */}
      </h2>
    </div>
  );
};

export default ButtonRevealingEffect;