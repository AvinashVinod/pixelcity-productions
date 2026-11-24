import React from 'react'
import LineRevealingEffect from '../partials/LineRevealingEffect'

const WhyUs = ({ description, imageUrl, imageAlt }) => {
  
  return (
    <div className='grid place-items-center h-fit w-full bg-white'>
        <div className="max-width w-full">
            <div className="relative pt-15 md:pt-0"> 
                <p className='small-para absolute uppercase font-semibold top-0'>why us?</p>
                <LineRevealingEffect
                  tag="h1"
                  className="text-black font-light opacity-90 capitalize text-4xl md:text-6xl [word-spacing:-0.9rem] mb-15 md:mb-20"
                  direction="up"
                  withBlur={true}
                  withRotation={true}
                  stagger={0.15}
                  duration={0.8}
                  start="top 80%"
                  markers={false}
                >
                  <span className="block md:hidden leading-none">More than pixels, it's about memories.</span>
                  <span className="hidden md:block ml-32">More than pixels, it's </span>
                  <span className="hidden md:inline">about <span>memories.</span></span>
                </LineRevealingEffect>
            </div>
            <p className='secondary-heading w-full leading-[38px] mt-10 grid md:grid-cols-2 gap-10 lg:h-dvh'>
              <div className="overflow-hidden h-[70vh] md:h-auto">
                        {/* Dynamic Main Image with Unsplash Fallback */}
                        <img 
                            src={imageUrl || "https://images.unsplash.com/photo-1648692809415-59baa8dd27b9?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} 
                            alt={imageAlt || "aboutPage-banner-img"} 
                        />
                    </div>
              {description ?? "new At PixelCity Productions, we don't just film weddings—we tell stories. We capture the quiet whispers and the grandest celebrations, weaving them into a cinematic narrative that feels as vivid as the moment itself."}
            </p>
        </div>
    </div>
  )
}

export default WhyUs