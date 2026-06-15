import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import React, { useRef, useState, useEffect } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Centralized Sanity Client Instance
import { client } from '../utils/client'

// Icons
import { RiCloseLine } from "react-icons/ri";

gsap.registerPlugin(ScrollTrigger)

const getEmbedUrl = (videoId) => {
  return `https://www.youtube.com/embed/${videoId}`
}

const Films = () => {
  const toggleRef = useRef(null)
  const cardsGridRef = useRef(null)
  const [isWedding, setIsWedding] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Sanity Data States
  const [pageTitle, setPageTitle] = useState('Luxury Editorial Films')
  const [preWeddingFilms, setPreWeddingFilms] = useState([])
  const [weddingFilms, setWeddingFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    client
      .fetch(
        `*[_type == "films"][0] {
          title,
          preWeddingFilms[] {
            "id": _key,
            coupleName,
            place,
            videoId,
            "coverImageUrl": coverImage.asset->url
          },
          weddingFilms[] {
            "id": _key,
            coupleName,
            place,
            videoId,
            "coverImageUrl": coverImage.asset->url
          }
        }`
      )
      .then((data) => {
        const cleanData = Array.isArray(data) ? data[0] : data;
        if (cleanData) {
          if (cleanData.title) setPageTitle(cleanData.title)
          if (cleanData.preWeddingFilms) setPreWeddingFilms(cleanData.preWeddingFilms)
          if (cleanData.weddingFilms) setWeddingFilms(cleanData.weddingFilms)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Sanity data fetch error:", err)
        setError(err)
        setLoading(false)
      })
  }, [])

  // Choose active dataset depending on current switch layout
  const currentFilms = isWedding ? weddingFilms : preWeddingFilms;

  // Toggle switcher slider node indicator layout animation
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

  // Intersection Observer element entry layout system
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

  // Trigger cascade animations cleanly when category state cycles or finishes loading
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        observeCards()
        ScrollTrigger.refresh()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isWedding, loading])

  const handleToggle = () => {
    setIsWedding(!isWedding)
  }

  const handleVideoClick = (video) => {
    setSelectedVideo(video)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedVideo(null)
  }

  const PlayIcon = () => (
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className="w-20 h-20 md:w-30 md:h-30 text-white/90 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  )

  if (error) {
    return (
      <div className="min-h-dvh w-full bg-white flex justify-center items-center">
        <p className="text-sm text-red-500 font-mono">
          Failed to load portfolio items.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-white">
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
        <h1 className='text-black text-center w-full px-[1rem] leading-none mt-10 mb-15 md:mb-20'>{pageTitle}</h1>
      </div>

      {/* Main content deck section wrapper */}
      <div className="relative min-h-screen px-[1rem] md:px-[2rem] pb-20">
        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <p className="text-gray-400 font-light tracking-widest text-sm uppercase">Loading Films...</p>
          </div>
        ) : currentFilms.length > 0 ? (
          <div 
            ref={cardsGridRef}
            className="grid gap-10"
          >
            {currentFilms.map((video, i) => {
              const baseImgUrl = video.coverImageUrl || `https://img.youtube.com/vi/${video.videoId.split('?')[0]}/hqdefault.jpg`;
              // Apply optimization parameters only if it's a dynamic Sanity asset URL
              const optimizedSrc = video.coverImageUrl ? `${baseImgUrl}?auto=format&q=75&w=1200` : baseImgUrl;

              return (
                <div 
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className="group relative aspect-[3/4] md:h-[90vh] w-full bg-black overflow-hidden cursor-pointer"
                >
                  <img 
                    className="group-hover:scale-105 transition-transform duration-500 w-full h-full object-cover" 
                    src={optimizedSrc} 
                    alt={video.coupleName}
                    loading={i === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.videoId.split('?')[0]}/hqdefault.jpg`
                    }}
                    onLoad={() => {
                      ScrollTrigger.refresh()
                    }}
                  />
                  <div className="absolute bg-black/60 inset-0 flex items-center justify-center pointer-events-none">
                    <PlayIcon />
                  </div>
                  <div className="absolute right-0 md:right-2 bottom-0 z-1 text-right text-white pb-4 md:pb-6 px-4">
                    <h3 className="text-[2rem] md:text-[3vw] h2 leading-none">{video.coupleName}</h3>
                    <p className="text-sm md:text-base opacity-90">{video.place}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[40vh]">
            <p className="text-gray-400 font-light tracking-wide text-sm">
              No films added yet for {isWedding ? 'Wedding' : 'Pre-Wedding'}.
            </p>
          </div>
        )}
      </div>

      {/* Video Modal Viewport */}
      {isModalOpen && selectedVideo && (
        <div 
          className="fixed inset-0 z-99999 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="grid place-items-center absolute top-6 right-4 md:top-7 md:right-6.5 z-10 rounded-full h-8.5 w-8.5 text-black bg-white cursor-pointer"
            aria-label="Close fullscreen view"
          >
            <RiCloseLine className='text-[1.6rem]' />
          </button>
          <div 
            className="relative w-full max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative pb-[56.25%] h-0">
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-2xl"
                src={getEmbedUrl(selectedVideo.videoId)}
                title={selectedVideo.coupleName}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Films