import React, { useState, useRef, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { client } from '../utils/client'

gsap.registerPlugin(ScrollTrigger)

// icons
import { RiCloseLine } from "react-icons/ri";
import { MdOutlineZoomOutMap } from "react-icons/md";


// Fullscreen Image Modal Component - No animations
const ImageModal = ({ image, onClose }) => {
  const modalRef = useRef(null)

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    
    // Close on escape key
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  // Handle background click to close
  const handleBackgroundClick = (e) => {
    if (e.target === modalRef.current) onClose()
  }

  return (
    <div 
      ref={modalRef}
      onClick={handleBackgroundClick}
      className="fixed inset-0 z-[1000] bg-black p-4 cursor-pointer"
      style={{ cursor: 'pointer' }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="grid place-items-center absolute top-4 right-4 md:top-7 md:right-6.5 z-10 rounded-full h-8.5 w-8.5 text-black bg-white cursor-pointer"
        aria-label="Close fullscreen view"
      >
        <RiCloseLine className='text-[1.6rem]' />
      </button>

      {/* Image Container */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:h-full w-full md:w-auto max-w-[90vw] max-h-[85vh]">
        <img
          src={image}
          alt="Fullscreen view"
          className="max-w-full max-h-[90vh] object-contain"
          style={{ cursor: 'default' }}
        />
        
      </div>
        {/* Hint text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white small-para pointer-events-none whitespace-nowrap">
          Click outside or press ESC to close
        </div>
    </div>
  )
}

const Monochrome = () => {
  const [isWedding, setIsWedding] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const toggleRef = useRef(null)
  const cardsGridRef = useRef(null)
  const [preWeddingImages, setPreWeddingImages] = useState([])
  const [weddingImages, setWeddingImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ========== FETCH MONOCHROME GALLERY FROM SANITY ==========
  useEffect(() => {
    client
      .fetch(
        `*[_type == "monochrome"][0] {
          "preWeddingImages": preWeddingPhotos[].asset->url,
          "weddingImages": weddingPhotos[].asset->url,
        }`,
      )
      .then((data) => {
        
        if (data) {
          setPreWeddingImages(data.preWeddingImages || []);
          setWeddingImages(data.weddingImages || []);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching monochrome gallery:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  // Get current images based on toggle state
  const currentImages = isWedding ? weddingImages : preWeddingImages

  useGSAP(() => {
    if (toggleRef.current) {
      if (isWedding) {
        gsap.to(toggleRef.current, {
          x: '143%',
          width: '40%',
          duration: 0.5,
          ease: 'power2.inOut'
        })
      } else {
        gsap.to(toggleRef.current, {
          x: '0%',
          width: '52.5%',
          duration: 0.5,
          ease: 'power2.inOut'
        })
      }
    }
  }, [isWedding])

  // Reveal animation using Intersection Observer
  const observeCards = () => {
    if (!cardsGridRef.current) return
    
    const cards = cardsGridRef.current.children
    const cardArray = Array.from(cards)
    
    cardArray.forEach((card) => {
      gsap.set(card, {
        y: 50,
        opacity: 0
      })
    })
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target
          const index = cardArray.indexOf(card)
          
          gsap.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: index * 0.05,
            ease: 'power3.out',
            overwrite: true
          })
          
          observer.unobserve(card)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    })
    
    cardArray.forEach((card) => {
      observer.observe(card)
    })
    
    return () => observer.disconnect()
  }

  useEffect(() => {
    if (!loading && currentImages.length > 0) {
      const timer = setTimeout(() => {
        observeCards()
        ScrollTrigger.refresh()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [currentImages, loading])

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [isWedding, loading])

  const handleToggle = () => {
    setIsWedding(!isWedding)
  }

  const handleImageClick = (image) => {
    setSelectedImage(image)
  }

  const handleCloseModal = () => {
    setSelectedImage(null)
  }

  if (error) {
    return (
      <div className='min-h-dvh h-full w-full bg-white flex items-center justify-center'>
        <p className="text-red-500">Error loading gallery: {error.message}</p>
      </div>
    )
  }

  return (
    <div className='min-h-dvh h-full w-full bg-white pb-10'>
      <div className="pt-25 md:pt-8">
        <div onClick={handleToggle} className="relative bg-black h-12 w-[30%] min-w-[18rem] max-w-[18rem] mx-auto rounded-full cursor-pointer">
          <div 
            ref={toggleRef}
            className="toggle-button absolute top-1/2 -translate-y-1/2 left-1 h-[85%] bg-white rounded-full mix-blend-difference"
            style={{ width: '52.5%' }}
          ></div>
          <div className="flex items-center justify-between px-5 h-full w-full rounded-full pointer-events-none">
            <p className='text-white'>PRE-WEDDING</p>
            <p className='text-white'>WEDDING</p>
          </div>
        </div>
        <h1 className='text-black text-center w-full px-[1rem] leading-none mt-10 mb-15 md:mb-20'>Monochrome series</h1>
      </div>

      {/* monochrome cards section */}
      <div className="relative min-h-screen px-[1rem] md:px-[2rem] pb-20">
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-gray-500">Loading images...</p>
          </div>
        ) : currentImages.length > 0 ? (
          <div 
            ref={cardsGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start"
          >
            {currentImages.map((img, i) => (
              <div 
                key={i} 
                className="w-full bg-white shadow-lg overflow-hidden cursor-pointer group"
                onClick={() => handleImageClick(img)}
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img 
                    src={img} 
                    alt="Monochrome"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onLoad={() => {
                      ScrollTrigger.refresh()
                    }}
                  />
                  
                  {/* Overlay effect on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <MdOutlineZoomOutMap className='text-white mt-0.5' />
                      <p className="text-white small-para">Click to view</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-gray-500">No images found in the gallery. Please upload images in Sanity Studio.</p>
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal - Opens instantly with no animation */}
      {selectedImage && (
        <ImageModal image={selectedImage} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default Monochrome