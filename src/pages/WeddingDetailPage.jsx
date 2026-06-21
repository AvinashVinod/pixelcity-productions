import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { client } from "../utils/client";
import Loading from "../partials/Loading";
import { FaInstagram } from "react-icons/fa";
import { TfiYoutube } from "react-icons/tfi";
import { RiCloseLine } from "react-icons/ri";
import LineRevealingEffect from "../partials/LineRevealingEffect";
import { MdOutlineZoomOutMap } from "react-icons/md";

gsap.registerPlugin(ScrollTrigger);

const dispatchPageReady = () =>
  window.dispatchEvent(new CustomEvent("page-content-ready"));

const ImageModal = ({ image, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  const handleBackgroundClick = (e) => {
    if (e.target === modalRef.current) onClose();
  };

  return (
    <div
      ref={modalRef}
      onClick={handleBackgroundClick}
      className="fixed inset-0 z-[9999] bg-black w-screen h-screen cursor-pointer flex items-center justify-center"
    >
      <button
        onClick={onClose}
        className="grid place-items-center fixed top-4 right-4 md:top-7 md:right-7 z-[10000] rounded-full h-9 w-9 text-black bg-white cursor-pointer"
        aria-label="Close fullscreen view"
      >
        <RiCloseLine className="text-[1.6rem]" />
      </button>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:h-full w-full md:w-auto max-w-[90vw] max-h-[85vh]">
        <img
          src={image}
          alt="Fullscreen view"
          className="max-w-full max-h-[90vh] object-contain"
          style={{ cursor: "default" }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-white small-para pointer-events-none whitespace-nowrap">
        Click outside or press ESC to close
      </div>
    </div>
  );
};

const WeddingDetailPage = () => {
  const { slug } = useParams();
  const pageRef = useRef(null);
  const [detail, setDetail] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError("No wedding specified");
      setLoading(false);
      return;
    }

    client
      .fetch(
        `*[_type == "wedding" && slug.current == $slug][0] {
      _id, coupleName, place, description,
      "mainImageUrl": mainImage.asset->url,
      "mainImageAlt": mainImage.alt,
      slug, youtubeVideoId, instagramUrl,
      "gallery": gallery[] { "imageUrl": asset->url, alt }
    }`,
        { slug },
      )
      .then((data) => {
        if (!data) {
          setError("Wedding not found");
          setLoading(false);
          return;
        }
        setDetail(data);
        setGallery(
          data.gallery?.length > 0
            ? data.gallery.map((img, i) => ({
                id: i + 1,
                image: img.imageUrl,
                alt: img.alt,
                title: img.alt || `${data.coupleName} - ${i + 1}`,
              }))
            : Array.from({ length: 13 }, (_, i) => ({
                id: i + 1,
                image: `/images/couple/couple-${i + 1}.jpg`,
                title: `Love Story Item ${i + 1}`,
              })),
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  useGSAP(
    () => {
      if (loading || !detail) return;

      gsap.set(pageRef.current, { y: 50, opacity: 0 });
      gsap.to(pageRef.current, {
        duration: 1,
        y: 0,
        opacity: 1,
        ease: "power2.out",
      });

      gsap.fromTo(
        ".hero-content",
        { y: 50, opacity: 0 },
        { duration: 1.2, y: 0, opacity: 1, ease: "power3.out" },
      );

      gsap.utils.toArray(".collage-card").forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: (index % 3) * 0.08,
            ease: "power4.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
              once: true,
            },
          },
        );
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true);
          dispatchPageReady();
        });
      });
    },
    { scope: pageRef, dependencies: [detail, loading, gallery] },
  );

  if (loading) return <Loading />;

  if (error)
    return (
      <section className="pt-25 px-[1rem] md:px-[2rem] pb-20 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </section>
    );

  if (!detail)
    return (
      <section className="pt-25 px-[1rem] md:px-[2rem] pb-20 bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Wedding Not Found</h2>
          <p className="text-gray-600">
            The wedding story you're looking for doesn't exist.
          </p>
        </div>
      </section>
    );

  return (
    <>
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      <section
        ref={pageRef}
        className="pt-25 px-[1rem] md:px-[2rem] pb-20 bg-white overflow-hidden"
      >
        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-10 md:h-dvh bg-[#E3E2DD] p-[1rem] md:p-10 rounded-lg">
          <div className="md:basis-[50%] h-[70vh] md:h-full w-full rounded-lg overflow-hidden">
            <img
              src={detail.mainImageUrl}
              alt={
                detail.mainImageAlt || `Wedding story of ${detail.coupleName}`
              }
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hero-content md:basis-[50%] flex flex-col justify-center gap-10">
            <p className="small-para tracking-widest font-semibold">
              The cinematic love story
            </p>
            <h1 className="leading-none [word-spacing:-20px]">
              {detail.coupleName}
            </h1>
            <p className="md:w-[70%] opacity-70 md:max-h-[200px] overflow-y-scroll custom-scrollbar">
              {detail.description ||
                "Experience a premium visual narrative where every frame is crafted to perfection, showcasing the elegance and raw emotion of a cinematic journey."}
            </p>
            <div className="flex gap-3">
              {detail.instagramUrl && (
                <a
                  href={detail.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[2rem] cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <FaInstagram />
                </a>
              )}
              {detail.youtubeVideoId && (
                <a
                  href={`https://www.youtube.com/watch?v=${detail.youtubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[2rem] cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <TfiYoutube />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Archives heading */}
        <LineRevealingEffect
          tag="h1"
          className="text-black font-light opacity-90 capitalize text-4xl md:text-6xl [word-spacing:-0.9rem] mb-15 mt-[7rem] md:mt-[7rem] w-fit mx-auto"
          direction="up"
          withBlur={true}
          withRotation={true}
          stagger={0.15}
          duration={0.8}
          start="top 80%"
          markers={false}
        >
          archives
        </LineRevealingEffect>

        {/* Gallery Grid */}
        <div className="bg-[#E3E2DD] p-[1rem] md:p-10 rounded-lg">
          <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="collage-card group relative bg-zinc-100 overflow-hidden rounded-lg break-inside-avoid cursor-pointer"
                onClick={() => setSelectedImage(item.image)}
              >
                <img
                  src={item.image}
                  alt={item.alt || item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain transition-transform duration-1000 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.parentElement.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <MdOutlineZoomOutMap className="text-white mt-0.5" />
                    <p className="text-white small-para">Click to view</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default WeddingDetailPage;
