import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const Preloader = ({ onLoadingComplete }) => {
  const preloaderRef = useRef(null)
  const preloaderOverlayRef = useRef(null)
  const gridContainerRef = useRef(null)
  const logoContainerRef = useRef(null)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadedImages, setLoadedImages] = useState([])

  // Responsive grid configuration - OPTIMIZED FOR PERFECT CENTERING
  const getGridConfig = () => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024
    
    if (width < 640) { // Mobile
      return {
        columns: 4,
        rows: 6,
        gap: 'gap-1',
        padding: 'p-1',
      }
    } else if (width >= 640 && width < 768) { // Small Tablet (640-768px)
      // 6x6 grid ensures 2x2 logo starts at row 2, col 2 (perfect center)
      return {
        columns: 6,
        rows: 6,
        gap: 'gap-1.5',
        padding: 'p-1.5',
      }
    } else if (width >= 768 && width < 1024) { // Tablet (768-1024px)
      // 6x6 grid ensures 2x2 logo starts at row 2, col 2 (perfect center)
      return {
        columns: 6,
        rows: 6,
        gap: 'gap-1.5',
        padding: 'p-1.5',
      }
    } else if (width >= 1024 && width < 1280) { // Small Desktop
      return {
        columns: 6,
        rows: 4,
        gap: 'gap-2',
        padding: 'p-2',
      }
    } else { // Large Desktop
      return {
        columns: 8,
        rows: 4,
        gap: 'gap-2',
        padding: 'p-2',
      }
    }
  }

  const [gridConfig, setGridConfig] = useState(getGridConfig())
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      setGridConfig(getGridConfig())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Generate image array from wedding-1.jpg to wedding-28.jpg
  const images = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    src: `/images/preloader/wedding-${i + 1}.jpg`,
    alt: `Wedding ${i + 1}`
  }))

  useEffect(() => {
    const loadAllImages = async () => {
      const imagePromises = images.map((image) => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.src = image.src
          img.onload = () => resolve(image)
          img.onerror = () => reject(new Error(`Failed to load ${image.src}`))
        })
      })

      try {
        const loaded = await Promise.all(imagePromises)
        setLoadedImages(loaded)
        setImagesLoaded(true)
      } catch (error) {
        console.error('Error loading images:', error)
        setImagesLoaded(true)
      }
    }

    loadAllImages()
  }, [])

  useGSAP(() => {
    if (imagesLoaded && gridContainerRef.current) {
      const imageItems = gridContainerRef.current.querySelectorAll('.image-grid-item')
      const logoContainer = gridContainerRef.current.querySelector('.preloader-logo__container')

      gsap.set(preloaderOverlayRef.current, {
        opacity: 0,
      })

      gsap.set(logoContainer, {
        y: 50,
        opacity: 0
      })
      
      gsap.set(imageItems, {
        y: 50,
        opacity: 0
      })
      
      const tl = gsap.timeline()

      tl.to(logoContainer, {
        y: 0,
        opacity: 1,
        duration: 1.5,
        ease: "power3.out",
      })
      
      tl.to(imageItems, {
        y: 0,
        opacity: 1,
        duration: 2.5,
        stagger: {
          each: 0.15,
          from: "center",
          grid: "auto",
        },
        ease: "power.out"
      })
       
      tl.to(preloaderOverlayRef.current, {
        duration: 0.7,
        opacity: 1,
        ease: 'expo.out'
      })
      
      tl.call(() => {
        setTimeout(() => {
          if (onLoadingComplete) onLoadingComplete()
        }, 500)
      })
    }
  }, [imagesLoaded])

  // Calculate centered position for 2x2 logo
  const getLogoPosition = () => {
    const { columns, rows } = gridConfig
    
    // For perfect centering of 2x2 block
    // Calculate center position and subtract 1 for starting position
    const logoRow = Math.floor((rows - 2) / 2)
    const logoCol = Math.floor((columns - 2) / 2)
    
    return { row: logoRow, col: logoCol }
  }

  const renderGridItems = () => {
    const items = []
    let imageIndex = 0
    
    const { columns, rows } = gridConfig
    const logoPos = getLogoPosition()
    
    console.log(`Width: ${windowWidth}px, Grid: ${columns}x${rows}, Logo at: row ${logoPos.row}, col ${logoPos.col}`)
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const isLogoArea = row >= logoPos.row && row < logoPos.row + 2 && 
                           col >= logoPos.col && col < logoPos.col + 2
        
        if (isLogoArea && row === logoPos.row && col === logoPos.col) {
          items.push(
            <div 
              key={`logo-container`}
              ref={logoContainerRef}
              className="preloader-logo__container relative z-10 flex flex-col justify-center items-center gap-3 md:gap-5 bg-black rounded-sm text-white overflow-hidden"
              style={{
                gridColumn: `${logoPos.col + 1} / span 2`,
                gridRow: `${logoPos.row + 1} / span 2`
              }}
            >
              <div className="absolute z-0 h-full w-full">
                <img src="https://i.pinimg.com/1200x/d5/a8/8a/d5a88aaab809f4370a209388c0c760d9.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute z-1 h-full w-full bg-black/60"></div>
              <div className="relative z-2 w-20 h-20 md:w-35 md:h-35">
                <img className='w-full h-full object-contain' src="/images/logo-white.png" alt="Logo" />
              </div>
            </div>
          )
          continue
        } 
        else if (!isLogoArea && imageIndex < images.length) {
          const image = images[imageIndex]
          items.push(
            <div 
              key={`image-${image.id}-${row}-${col}`}
              className="image-grid-item bg-gray-200 overflow-hidden rounded-sm"
              data-row={row}
              data-col={col}
            >
              {imagesLoaded && (
                <img 
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              )}
              {!imagesLoaded && (
                <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
              )}
            </div>
          )
          imageIndex++
        } else if (!isLogoArea) {
          items.push(
            <div 
              key={`empty-${row}-${col}`}
              className="bg-gray-200 overflow-hidden rounded-sm"
            ></div>
          )
        }
      }
    }
    
    return items
  }

  return (
    <div className="fixed top-0 left-0 z-5 h-full w-full">
      <div ref={preloaderOverlayRef} className="absolute z-10 h-full w-full bg-black/70 pointer-events-none opacity-0"></div>
      <div
        ref={preloaderRef}
        className='relative z-0 w-full h-full bg-black'
      >
        <div 
          ref={gridContainerRef}
          className={`grid ${gridConfig.gap} ${gridConfig.padding} h-dvh w-full`}
          style={{
            gridTemplateColumns: `repeat(${gridConfig.columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
            overflow: 'hidden'
          }}
        >
          {renderGridItems()}
        </div>
      </div>
    </div>
  )
}

export default Preloader