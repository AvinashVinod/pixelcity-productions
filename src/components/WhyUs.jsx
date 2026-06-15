import React from 'react'
import LineRevealingEffect from '../partials/LineRevealingEffect'

const WhyUs = ({ description }) => {
  
  return (
    <div className='grid place-items-center h-fit w-full bg-white'>
        <div className="max-width w-full">
            <div className="relative pt-15 md:pt-0"> 
                <p className='small-para absolute uppercase font-semibold top-0'>why us?</p>
                <LineRevealingEffect
                  tag="h1"
                  className="text-black font-light opacity-90 capitalize text-4xl md:text-6xl [word-spacing:-0.9rem]"
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
            <p className='secondary-heading w-full lg:w-[48%] leading-[38px] ml-auto mt-10'>
              {description ?? "new At PixelCity Productions, we don't just film weddings—we tell stories. We capture the quiet whispers and the grandest celebrations, weaving them into a cinematic narrative that feels as vivid as the moment itself."}
            </p>
        </div>
    </div>
  )
}

export default WhyUs