import Lenis from 'lenis';

class LenisManager {
  constructor(options = {}) {
    const defaultOptions = {
      autoRaf: true,
      lerp: 0.1,
      duration: 4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      infinite: false,
      gestureOrientation: 'vertical',
      smoothTouch: false,
    };

    this.lenis = new Lenis({ ...defaultOptions, ...options });
  }

  onScroll(callback) {
    if (callback && typeof callback === 'function') {
      this.lenis.on('scroll', callback);
    }
  }

  destroy() {
    this.lenis.destroy();
  }
}

export default LenisManager;