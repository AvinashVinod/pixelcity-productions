import React from 'react';

// Component for clickable image card with overlay
const ClickableImageCard = ({ src, coupleName, location, url }) => (
  <a href={url} className="block w-full bg-white shadow-lg overflow-hidden group cursor-pointer relative">
    <div className="aspect-[3/4] relative overflow-hidden">
      <img 
        src={src} 
        alt={`${coupleName} Wedding`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        decoding="async"
      />
      {/* Overlay div */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center">
        <div className="text-center text-white pb-4 md:pb-6 px-4">
          <h3 className="text-[2rem] md:text-[3vw] h2 leading-none">{coupleName}</h3>
          <p className="text-sm md:text-base opacity-90">{location}</p>
        </div>
      </div>
    </div>
  </a>
);

export default ClickableImageCard;