// utils/preloadImage.js
// Loads AND decodes an image before resolving, so when the same src is put
// into an <img> it paints instantly (no grey box, no progressive reveal).
// Promises are cached per-src, so the Preloader, the Banner and React
// StrictMode's double effects never download the same file twice.

const cache = new Map();

export const preloadImage = (src) => {
  if (!src) return Promise.reject(new Error("preloadImage: missing src"));
  if (cache.has(src)) return cache.get(src);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";

    img.onload = () => {
      const done = () => resolve(src);
      // decode() guarantees the bitmap is ready to paint; fall back gracefully
      if (typeof img.decode === "function") img.decode().then(done, done);
      else done();
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));

    img.src = src;
  });

  cache.set(src, promise);
  // Don't cache failures — allow a retry on the next visit
  promise.catch(() => cache.delete(src));

  return promise;
};

export default preloadImage;