import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { client } from '../utils/client';
import Loading from '../partials/Loading';
import { FaInstagram } from "react-icons/fa";
import { TfiYoutube } from "react-icons/tfi";
import LineRevealingEffect from '../partials/LineRevealingEffect';

gsap.registerPlugin(ScrollTrigger);

const dispatchPageReady = () => window.dispatchEvent(new CustomEvent('page-content-ready'));

const WeddingDetailPage = () => {
  const { slug }               = useParams();
  const pageRef                = useRef(null);
  const [detail, setDetail]    = useState(null);
  const [gallery, setGallery]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState(null);

  useEffect(() => {
    if (!slug) { setError("No wedding specified"); setLoading(false); return; }

    client.fetch(`*[_type == "wedding" && slug.current == $slug][0] {
      _id, coupleName, place, description,
      "mainImageUrl": mainImage.asset->url,
      "mainImageAlt": mainImage.alt,
      slug, youtubeVideoId, instagramUrl,
      "gallery": gallery[] { "imageUrl": asset->url, alt }
    }`, { slug })
    .then((data) => {
      if (!data) { setError("Wedding not found"); setLoading(false); return; }
      setDetail(data);
      setGallery(
        data.gallery?.length > 0
          ? data.gallery.map((img, i) => ({ id: i + 1, image: img.imageUrl, alt: img.alt, title: img.alt || `${data.coupleName} - ${i + 1}` }))
          : Array.from({ length: 13 }, (_, i) => ({ id: i + 1, image: `/images/couple/couple-${i + 1}.jpg`, title: `Love Story Item ${i + 1}` }))
      );
      setLoading(false);
    })
    .catch((err) => { setError(err.message); setLoading(false); });
  }, [slug]);

  useGSAP(() => {
    if (loading || !detail) return;

    gsap.set(pageRef.current, { y: 50, opacity: 0 });
    gsap.to(pageRef.current, { duration: 1, y: 0, opacity: 1, ease: "power2.out" });

    gsap.fromTo(".hero-content",
      { y: 50, opacity: 0 },
      { duration: 1.2, y: 0, opacity: 1, ease: "power3.out" }
    );

    gsap.utils.toArray('.collage-card').forEach((card, index) => {
      gsap.fromTo(card,
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1,
          delay: (index % 3) * 0.08,
          ease: "power4.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true
          }
        }
      );
    });

    // Fire page-content-ready AFTER all triggers are registered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh(true);
        dispatchPageReady();
      });
    });

  }, { scope: pageRef, dependencies: [detail, loading, gallery] });

  if (loading) return <Loading />;

  if (error) return (
    <section className="pt-25 px-[1rem] md:px-[2rem] pb-20 bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    </section>
  );

  if (!detail) return (
    <section className="pt-25 px-[1rem] md:px-[2rem] pb-20 bg-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Wedding Not Found</h2>
        <p className="text-gray-600">The wedding story you're looking for doesn't exist.</p>
      </div>
    </section>
  );

  return (
    <section ref={pageRef} className="pt-25 px-[1rem] md:px-[2rem] pb-20 bg-white overflow-hidden">
      <div className="flex flex-col md:flex-row gap-10 md:h-dvh bg-[#E3E2DD] p-[1rem] md:p-10 rounded-lg">
        <div className="md:basis-[50%] h-[70vh] md:h-full w-full rounded-lg overflow-hidden">
          <img
            src={detail.mainImageUrl}
            alt={detail.mainImageAlt || `Wedding story of ${detail.coupleName}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hero-content md:basis-[50%] flex flex-col justify-center gap-10">
          <p className='small-para tracking-widest font-semibold'>The cinematic love story</p>
          <h1 className='leading-none [word-spacing:-20px]'>{detail.coupleName}</h1>
          <p className='w-[70%] opacity-70'>
            {detail.description || "Experience a premium visual narrative where every frame is crafted to perfection, showcasing the elegance and raw emotion of a cinematic journey."}
          </p>
          <div className="flex gap-3">
            {detail.instagramUrl && (
              <a href={detail.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[2rem] cursor-pointer hover:opacity-70 transition-opacity">
                <FaInstagram />
              </a>
            )}
            {detail.youtubeVideoId && (
              <a href={`https://www.youtube.com/watch?v=${detail.youtubeVideoId}`} target="_blank" rel="noopener noreferrer" className="text-[2rem] cursor-pointer hover:opacity-70 transition-opacity">
                <TfiYoutube />
              </a>
            )}
          </div>
        </div>
      </div>

      <LineRevealingEffect
        tag="h1"
        className="text-black font-light opacity-90 capitalize text-4xl md:text-6xl [word-spacing:-0.9rem] mb-15 mt-[7rem] md:mt-[7rem] w-fit mx-auto"
        direction="up" withBlur={true} withRotation={true}
        stagger={0.15} duration={0.8} start="top 80%" markers={false}
      >
        archives
      </LineRevealingEffect>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-[#E3E2DD] p-[1rem] md:p-10 rounded-lg">
        {gallery.map((item) => (
          <div key={item.id} className="collage-card group relative w-full aspect-[3/4] bg-zinc-100 overflow-hidden rounded-lg">
            <img
              src={item.image}
              alt={item.alt || item.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeddingDetailPage;