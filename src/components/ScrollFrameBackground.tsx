import React, { useEffect, useRef, useCallback } from 'react';

const TOTAL_FRAMES = 300;

const getFrameUrl = (index: number): string => {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, index));
  return `/frames/ezgif-frame-${String(clamped).padStart(3, '0')}.png`;
};

interface ScrollFrameBackgroundProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export const ScrollFrameBackground: React.FC<ScrollFrameBackgroundProps> = ({
  containerRef,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const targetFrameRef = useRef<number>(1);
  const currentFrameRef = useRef<number>(1);
  const lastRenderedRef = useRef<number>(0);
  const needsRedrawRef = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);

  // Helper to find nearest loaded image
  const getClosestLoadedImage = useCallback((targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    if (images.has(targetIndex)) {
      const img = images.get(targetIndex)!;
      if (img.complete && img.naturalWidth > 0) return img;
    }
    let closest: HTMLImageElement | null = null;
    let minDiff = Infinity;
    for (const [idx, img] of images.entries()) {
      if (img.complete && img.naturalWidth > 0) {
        const diff = Math.abs(idx - targetIndex);
        if (diff < minDiff) {
          minDiff = diff;
          closest = img;
        }
      }
    }
    return closest;
  }, []);

  // Draw frame to canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = getClosestLoadedImage(frameIndex);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw === 0 || ch === 0) return;

    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;

    // Cover math preserving aspect ratio
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, [getClosestLoadedImage]);

  // Resize canvas according to display dimensions & DPR
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const newWidth = Math.floor((rect.width || window.innerWidth) * dpr);
    const newHeight = Math.floor((rect.height || window.innerHeight) * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      drawFrame(Math.round(currentFrameRef.current));
    }
  }, [drawFrame]);

  // Load a single frame with caching
  const loadSingleFrame = useCallback((index: number): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      if (imagesRef.current.has(index)) {
        const cached = imagesRef.current.get(index)!;
        if (cached.complete && cached.naturalWidth > 0) {
          resolve(cached);
          return;
        }
      }
      const img = new Image();
      img.src = getFrameUrl(index);
      img.onload = () => {
        imagesRef.current.set(index, img);
        // Immediate redraw if frame 1 or current target
        if (index === 1 || Math.round(currentFrameRef.current) === index) {
          needsRedrawRef.current = true;
          drawFrame(index);
        }
        resolve(img);
      };
      img.onerror = () => {
        resolve(img);
      };
    });
  }, [drawFrame]);

  // Progressive preloading
  useEffect(() => {
    let cancelled = false;

    // 1. Immediately load frame 1 for instant display
    loadSingleFrame(1).then(() => {
      if (!cancelled) {
        handleResize();
        drawFrame(1);
      }
    });

    // 2. Preload initial window (2-30) for instant scroll response
    const preloadSequence = async () => {
      for (let i = 2; i <= 30; i++) {
        if (cancelled) return;
        await loadSingleFrame(i);
      }

      // 3. Stride load across remaining 300 frames for quick general coverage
      for (let i = 35; i <= TOTAL_FRAMES; i += 5) {
        if (cancelled) return;
        await loadSingleFrame(i);
      }

      // 4. Fill in all remaining intermediate frames progressively
      for (let i = 2; i <= TOTAL_FRAMES; i++) {
        if (cancelled) return;
        if (!imagesRef.current.has(i)) {
          await loadSingleFrame(i);
        }
      }
    };

    preloadSequence();

    return () => {
      cancelled = true;
    };
  }, [loadSingleFrame, handleResize, drawFrame]);

  // Scroll listener: strictly maps scroll position to frame sequence
  useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      let progress = 0;
      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollableDist = rect.height - window.innerHeight;
        if (scrollableDist <= 0) {
          targetFrameRef.current = 1;
          return;
        }
        const scrolled = -rect.top;
        progress = Math.max(0, Math.min(1, scrolled / scrollableDist));
      } else {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) {
          targetFrameRef.current = 1;
          return;
        }
        progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      }

      const frame = 1 + Math.round(progress * (TOTAL_FRAMES - 1));
      targetFrameRef.current = Math.min(TOTAL_FRAMES, Math.max(1, frame));
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [containerRef, handleResize]);

  // Animation Loop (LERP smoothing between scroll target and canvas)
  useEffect(() => {
    const renderLoop = () => {
      const target = targetFrameRef.current;
      const current = currentFrameRef.current;
      const diff = target - current;

      if (Math.abs(diff) > 0.04) {
        currentFrameRef.current += diff * 0.25;
        const rounded = Math.round(currentFrameRef.current);
        if (rounded !== lastRenderedRef.current || needsRedrawRef.current) {
          drawFrame(rounded);
          lastRenderedRef.current = rounded;
          needsRedrawRef.current = false;
        }
      } else if (Math.round(current) !== lastRenderedRef.current || needsRedrawRef.current) {
        currentFrameRef.current = target;
        drawFrame(target);
        lastRenderedRef.current = target;
        needsRedrawRef.current = false;
      }

      rafIdRef.current = requestAnimationFrame(renderLoop);
    };

    rafIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [drawFrame]);

  // Initial resize
  useEffect(() => {
    handleResize();
  }, [handleResize]);

  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}>
      {/* 
        1. Base Fallback Image:
        Guarantees Frame 1 is painted on initial HTML render without any blank flash!
      */}
      <img
        src="/frames/ezgif-frame-001.png"
        alt="3D Food Rescue Scene"
        className="absolute inset-0 w-full h-full object-cover block select-none pointer-events-none"
      />

      {/* 
        2. HTML5 Canvas:
        Renders the active scroll-controlled sequential PNG frame (1 to 300)
      */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover block select-none pointer-events-none"
        aria-hidden="true"
      />

      {/* 
        3. Subtle Left Vignette:
        Enhances text readability on the left without covering up the 3D model
      */}
      <div 
        className="absolute inset-y-0 left-0 w-full lg:w-1/2 bg-gradient-to-r from-white/80 via-white/40 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
};

