import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const LineRevealingEffect = ({ 
  children,
  className = "",
  tag: Tag = "div",
  start = "top 80%",
  end = "bottom 30%",
  scrub = false,
  once = true,
  stagger = 0.12,
  duration = 0.9,
  ease = "back.out(0.7)",
  splitType = "lines",
  delay = 0,
  markers = false,
  // New attractive features
  direction = "up", // "up", "down", "left", "right", "scale"
  withBlur = true,
  withRotation = true,
  withFade = true,
  onComplete = null
}) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useGSAP(() => {
    if (!textRef.current) return;

    const split = new SplitText(textRef.current, {
      type: splitType,
    });

    let elementsToAnimate = split[splitType];
    
    if (!elementsToAnimate || elementsToAnimate.length === 0) {
      console.warn(`No elements found for splitType: ${splitType}`);
      return;
    }

    // Configure initial animation properties based on direction
    const getInitialProps = () => {
      const props = {
        opacity: withFade ? 0 : 1,
      };
      
      switch(direction) {
        case "up":
          props.y = 60;
          props.rotationX = withRotation ? -20 : 0;
          break;
        case "down":
          props.y = -60;
          props.rotationX = withRotation ? 20 : 0;
          break;
        case "left":
          props.x = 60;
          props.rotationY = withRotation ? -20 : 0;
          break;
        case "right":
          props.x = -60;
          props.rotationY = withRotation ? 20 : 0;
          break;
        case "scale":
          props.scale = 0.5;
          break;
        default:
          props.y = 60;
      }
      
      if (withBlur) {
        props.filter = "blur(8px)";
      }
      
      return props;
    };

    // Set initial hidden state
    gsap.set(elementsToAnimate, {
      ...getInitialProps(),
      transformOrigin: "top center"
    });

    // Animate to visible state
    const animateToProps = {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      filter: "blur(0px)",
      duration: duration,
      stagger: {
        amount: stagger * (elementsToAnimate.length / 5),
        from: "start",
        ease: "power2.out"
      },
      delay: delay,
      ease: ease,
    };

    // Create scroll trigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: start,
        end: end,
        scrub: scrub,
        markers: markers,
        toggleActions: once ? "play none none reverse" : "play reverse play reverse",
        invalidateOnRefresh: true,
      },
      onComplete: () => onComplete && onComplete()
    });

    tl.to(elementsToAnimate, animateToProps);

    return () => {
      split.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [splitType, start, end, scrub, once, stagger, duration, ease, delay, markers, direction, withBlur, withRotation, withFade]);

  return (
    <div ref={containerRef} className="reveal-container">
      <Tag ref={textRef} className={className}>
        {children}
      </Tag>
    </div>
  );
};

export default LineRevealingEffect;