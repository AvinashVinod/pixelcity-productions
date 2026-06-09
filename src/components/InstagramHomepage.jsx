import React from "react";
import LineRevealingEffect from "../partials/LineRevealingEffect";
import ButtonRevealingEffect from "../partials/ButtonRevealingEffect";

const FALLBACK_POSTS = [
  { url: "https://www.instagram.com/reel/DSPjhNvAUnR/", imageUrl: "https://media1.tenor.com/m/zE0-_uPbq2sAAAAC/wedding-jitesh.gif", imageAlt: "Instagram reel 1" },
  { url: "https://www.instagram.com/reel/DQvqvdLgdMB/", imageUrl: "https://images.squarespace-cdn.com/content/v1/69b2dc11b1a074717c55f666/1773332814026-3J4WFIZO8BMT9XV38IKX/293+Best+wedding+photographer+Northern+Ireland.GIF?format=1500w", imageAlt: "Instagram reel 2" },
  { url: "https://www.instagram.com/reel/DRXBcQpgRab/", imageUrl: "https://images.squarespace-cdn.com/content/v1/69b2dc11b1a074717c55f666/1773332814093-VK9QP3L4BKE9EXOXSEZP/Best+Wedding+Photographers+Belfast+Northern+Ireland+288.GIF?format=1000w", imageAlt: "Instagram reel 3" },
  { url: "https://www.instagram.com/reel/DXJIBI6gak4/", imageUrl: "https://images.squarespace-cdn.com/content/v1/69b2dc11b1a074717c55f666/1773332814751-37XL2ISY7P8A6EU8UHB9/Alternative+Wedding+Photography+Belfast+Sara+%26+Dan+068.GIF?format=2500w", imageAlt: "Instagram reel 4" },
  { url: "https://www.instagram.com/reel/DWsvh4PAd4s/", imageUrl: "https://images.squarespace-cdn.com/content/v1/69b2dc11b1a074717c55f666/1773332813918-XDC5W43FD87Z2IC1RCS9/Cool%2BWedding%2Bcinemagraph%2Bgif.gif?format=2500w", imageAlt: "Instagram reel 5" },
];

const PlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-12 h-12 md:w-16 md:h-16 text-white/90 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const InstagramHomepage = ({ posts = [] }) => {
  const items = posts.length > 0 ? posts : FALLBACK_POSTS;

  return (
    <div className="grid place-items-center h-full w-full bg-white overflow-hidden">
      <div className="max-width w-full">
        <div className="">
          <p className="small-para uppercase font-semibold mb-10">instagram</p>
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
            Follow the moments.
          </LineRevealingEffect>
        </div>

        <div className="instagram-posts__container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-15 lg:mb-10">
  {items.map((post, i) => (
    <a
      key={i}
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative w-full block cursor-pointer"
    >
      {/* Aspect ratio container - 9:16 for Instagram Reel/Post shape */}
      <div className="relative w-full aspect-[9/16] overflow-hidden">
        <img
          src={post.imageUrl}
          alt={post.imageAlt || `instagram-post-${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 transition-all duration-500 group-hover:bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <PlayIcon />
        </div>
        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3">
          <p className="small-para text-white drop-shadow-md text-xs md:text-sm">Explore Story</p>
        </div>
      </div>
    </a>
  ))}
</div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-10 md:gap-0">
          <div className="">
            <p className="small-para font-semibold text-black">connect with us</p>
            <h2 className="secondary-heading leading-[38px]">@pixelcityproductions</h2>
          </div>
          <a
            href="https://www.instagram.com/pixelcityproductions/"
            target="_blank"
            rel="noopener noreferrer"
            className='group inline-block border border-black text-black hover:text-white hover:bg-black px-10 py-3 transition-all duration-500 rounded-full cursor-pointer pointer-events-auto w-fit'
          >
            <ButtonRevealingEffect text="View on Instagram" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstagramHomepage;