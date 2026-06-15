import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ClickableImageCard from '../partials/ClickableImageCard';
import Loading from '../partials/Loading';
import { client } from '../utils/client';

const WeddingPage = () => {
  const containerRef = useRef(null);
  const [preloaderImages, setPreloaderImages] = useState([]);
  const [weddingData, setWeddingData] = useState([]);
  const [wedding, setWedding] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const preloaderWrapperRef = useRef(null);
  const newWrapperRef = useRef(null);
  const weddingPageHeadingRef = useRef(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // ========== FETCH ALL WEDDINGS FROM SANITY ==========
  useEffect(() => {
    client
      .fetch(
        `*[_type == "wedding"] | order(_createdAt desc) {
          _id,
          coupleName,
          place,
          "mainImageUrl": mainImage.asset->url,
          "mainImageAlt": mainImage.alt,
          slug,
        }`,
      )
      .then((data) => {
        setWeddingData(data);
        
        if (data && data.length > 0) {
          setWedding(data[0]);
          setLoading(false); // Stop loading once we have data
        }
      })
      .catch((err) => {
        console.error("Error fetching weddings:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  // ========== LOAD PRELOADER IMAGES ONLY ==========
  useEffect(() => {
    // PRELOADER CARDS: Fixed at 18 images
    const preloaderCount = 18;
    const preloaderPaths = Array.from({ length: preloaderCount }, (_, i) => `/images/preloader/wedding-${i + 1}.jpg`);
    setPreloaderImages(preloaderPaths);
  }, []);

  // Split preloader images based on screen size
  const getResponsivePreloaderColumns = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    if (width < 768) {
      return {
        col1: preloaderImages,
        col2: [],
        col3: []
      };
    } else if (width < 1024) {
      return {
        col1: preloaderImages.filter((_, i) => i % 2 === 0),
        col2: preloaderImages.filter((_, i) => i % 2 === 1),
        col3: []
      };
    } else {
      return {
        col1: preloaderImages.filter((_, i) => i % 3 === 0),
        col2: preloaderImages.filter((_, i) => i % 3 === 1),
        col3: preloaderImages.filter((_, i) => i % 3 === 2)
      };
    }
  };
  
  // ========== USE SANITY DATA DIRECTLY (NO LOCAL IMAGES) ==========
  const getResponsiveNewColumns = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    
    if (width < 768) { // Mobile - 1 column
      return {
        col1: weddingData,
        col2: [],
        col3: []
      };
    } else if (width < 1024) { // Tablet - 2 columns
      return {
        col1: weddingData.filter((_, i) => i % 2 === 0),
        col2: weddingData.filter((_, i) => i % 2 === 1),
        col3: []
      };
    } else { // Desktop - 3 columns
      return {
        col1: weddingData.filter((_, i) => i % 3 === 0),
        col2: weddingData.filter((_, i) => i % 3 === 1),
        col3: weddingData.filter((_, i) => i % 3 === 2)
      };
    }
  };
  
  const preloaderCols = getResponsivePreloaderColumns();
  const newCardCols = getResponsiveNewColumns();

  // ========== GSAP ANIMATIONS ==========
  useGSAP(() => {
    if (preloaderImages.length === 0 || loading || !preloaderWrapperRef.current) return;

    const getColumnSelectors = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        return {
          preloader: [".preloader-col-1"],
          new: [".new-col-1"]
        };
      } else if (width < 1024) {
        return {
          preloader: [".preloader-col-1", ".preloader-col-2"],
          new: [".new-col-1", ".new-col-2"]
        };
      } else {
        return {
          preloader: [".preloader-col-1", ".preloader-col-2", ".preloader-col-3"],
          new: [".new-col-1", ".new-col-2", ".new-col-3"]
        };
      }
    };
    
    const columnSelectors = getColumnSelectors();
    const preloaderColumns = columnSelectors.preloader;
    const newColumns = columnSelectors.new;
    
    const getMoveDistance = () => "-100%";
    const getNewMoveDistance = () => "0%";
    
    const moveDistance = getMoveDistance();
    const newMoveDistance = getNewMoveDistance();
    
    const getStartPositions = () => {
      const width = window.innerWidth;
      if (width < 768) return ["2vh"];
      if (width < 1024) return ["1.5vh", "3.5vh"];
      return ["1vh", "3vh", "2vh"];
    };
    
    const startPositions = getStartPositions();
    
    preloaderColumns.forEach((colClass, index) => {
      gsap.set(colClass, { y: startPositions[index] });
    });
    
    newColumns.forEach((colClass) => {
      gsap.set(colClass, { y: "100%" });
    });

    gsap.set(weddingPageHeadingRef.current, {
      opacity: 0,
      y: 100
    });

    const getPreloaderDuration = () => {
      if (window.innerWidth < 768) return 10;
      if (window.innerWidth < 1024) return 3.5;
      return 6;
    };
    
    const newCardsDuration = 5;
    const preloaderDuration = getPreloaderDuration();
    const animationEase = "power4.inOut";
    
    preloaderColumns.forEach((colClass, index) => {
      gsap.to(colClass, {
        y: moveDistance,
        duration: preloaderDuration,
        ease: animationEase,
        delay: index * 0.15,
        onComplete: () => {
          if (colClass === preloaderColumns[preloaderColumns.length - 1]) {
            if (preloaderWrapperRef.current) {
              gsap.set(preloaderWrapperRef.current, { 
                visibility: "hidden",
                opacity: 0 
              });
            }
          }
        }
      });
    });

    const getWeddingHeadingDelay = () => {
      if (window.innerWidth < 768) return 10;
      if (window.innerWidth < 1024) return 4.5;
      return 6.5;
    };

    const weddingHeadingDelay = getWeddingHeadingDelay();
    
    gsap.to(weddingPageHeadingRef.current, {
      delay: weddingHeadingDelay,
      duration: 1.2,
      y: 0,
      opacity: 1,
      ease: "back.out(0.5)",
      onStart: () => {
        gsap.set(weddingPageHeadingRef.current, { visibility: "visible" });
      }
    });
    
    const startTime = preloaderDuration * 0.5 * 1000;
    
    setTimeout(() => {
      newColumns.forEach((colClass, index) => {
        gsap.to(colClass, {
          y: newMoveDistance,
          duration: newCardsDuration,
          ease: "power3.inOut",
          delay: index * 0.1,
          onComplete: () => {
            if (colClass === newColumns[newColumns.length - 1]) {
              setIsAnimationComplete(true);
              if (preloaderWrapperRef.current) {
                preloaderWrapperRef.current.style.display = "none";
              }
              newColumns.forEach((col) => {
                gsap.set(col, { clearProps: "transform" });
              });
            }
          }
        });
      });
    }, startTime);
    
    const handleResize = () => {
      if (preloaderWrapperRef.current && !isAnimationComplete) {
        preloaderColumns.forEach((colClass) => {
          gsap.killTweensOf(colClass);
          gsap.set(colClass, { y: moveDistance });
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    
  }, [preloaderImages, loading]);
  
  if (loading) {
    return <Loading />;
  }
  
  return (
    <section ref={containerRef} className="relative w-full bg-white overflow-hidden pb-20">
      <h1 ref={weddingPageHeadingRef} className='text-black absolute z-20 text-center w-full pt-25 md:pt-8 px-[1rem] leading-none opacity-0'>Wedding Stories</h1>

      <div className="relative min-h-screen p-[1rem] md:p-[2rem]">
        
        {/* Preloader Cards - UNCHANGED */}
        <div 
          ref={preloaderWrapperRef} 
          className="absolute top-0 left-0 w-full z-10 bg-white"
          style={{ pointerEvents: 'none' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start px-[1rem] md:px-[2rem]">
            <div className="preloader-col-1 flex flex-col gap-4 md:gap-6 will-change-transform">
              {preloaderCols.col1.map((img, i) => (
                <div key={i} className="w-full bg-white shadow-lg overflow-hidden">
                  <div className="aspect-[3/4]">
                    <img 
                      src={img} 
                      alt="Wedding Cinematic"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {preloaderCols.col2.length > 0 && (
              <div className="preloader-col-2 hidden sm:flex flex-col gap-4 md:gap-6 will-change-transform">
                {preloaderCols.col2.map((img, i) => (
                  <div key={i} className="w-full bg-white shadow-lg overflow-hidden">
                    <div className="aspect-[3/4]">
                      <img 
                        src={img} 
                        alt="Wedding Cinematic"
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {preloaderCols.col3.length > 0 && (
              <div className="preloader-col-3 hidden lg:flex flex-col gap-4 md:gap-6 will-change-transform">
                {preloaderCols.col3.map((img, i) => (
                  <div key={i} className="w-full bg-white shadow-lg overflow-hidden">
                    <div className="aspect-[3/4]">
                      <img 
                        src={img} 
                        alt="Wedding Cinematic"
                        className="w-full h-full object-cover"
                        loading="eager"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========== NEW CARDS USING SANITY IMAGES ========== */}
        <div ref={newWrapperRef} className="margin-top--custom relative z-0 mt-[30vh] md:mt-[10vh] lg:mt-[10vw]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
            
            {/* Column 1 */}
            <div className="new-col-1 flex flex-col gap-4 md:gap-6 will-change-transform">
              {newCardCols.col1.map((weddingItem, index) => {
                const slugUrl = weddingItem?.slug?.current 
                  ? `/wedding/${weddingItem.slug.current}` 
                  : `/wedding/couple-${index + 1}`;
                
                return (
                  <ClickableImageCard 
                    key={weddingItem?._id || index}
                    src={weddingItem?.mainImageUrl} // ✅ Using Sanity image URL
                    coupleName={weddingItem?.coupleName || "Couple Name"}
                    location={weddingItem?.place || "Location"}
                    url={slugUrl}
                  />
                );
              })}
            </div>
            
            {/* Column 2 */}
            {newCardCols.col2.length > 0 && (
              <div className="new-col-2 hidden sm:flex flex-col gap-4 md:gap-6 will-change-transform">
                {newCardCols.col2.map((weddingItem, index) => {
                  const slugUrl = weddingItem?.slug?.current 
                    ? `/wedding/${weddingItem.slug.current}` 
                    : `/wedding/couple-${index + 1}`;
                  
                  return (
                    <ClickableImageCard 
                      key={weddingItem?._id || index}
                      src={weddingItem?.mainImageUrl} // ✅ Using Sanity image URL
                      coupleName={weddingItem?.coupleName || "Couple Name"}
                      location={weddingItem?.place || "Location"}
                      url={slugUrl}
                    />
                  );
                })}
              </div>
            )}
            
            {/* Column 3 */}
            {newCardCols.col3.length > 0 && (
              <div className="new-col-3 hidden lg:flex flex-col gap-4 md:gap-6 will-change-transform">
                {newCardCols.col3.map((weddingItem, index) => {
                  const slugUrl = weddingItem?.slug?.current 
                    ? `/wedding/${weddingItem.slug.current}` 
                    : `/wedding/couple-${index + 1}`;
                  
                  return (
                    <ClickableImageCard 
                      key={weddingItem?._id || index}
                      src={weddingItem?.mainImageUrl} // ✅ Using Sanity image URL
                      coupleName={weddingItem?.coupleName || "Couple Name"}
                      location={weddingItem?.place || "Location"}
                      url={slugUrl}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default WeddingPage;