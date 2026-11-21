"use client";
import { useState, useRef, useEffect, memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { optimizeImage, generateSrcSet, isCloudinaryConfigured, type CloudinaryOptions } from '@/lib/cloudinary';
import { CoverPlaceholder } from '@/components/SafeImage';
import { isPlausibleImageUrl } from '@/lib/safeImage';

interface LQIPImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderColor?: string;
  aspectRatio?: 'video' | 'square' | '4/3' | '3/2' | 'auto';
  priority?: boolean;
  onLoad?: () => void;
  /** Width for Cloudinary optimization */
  width?: number;
  /** Height for Cloudinary optimization */
  height?: number;
  /** Cloudinary optimization options */
  optimize?: CloudinaryOptions;
  /** Responsive widths for srcset generation */
  sizes?: string;
}

/**
 * Low-Quality Image Placeholder (LQIP) component with Cloudinary CDN optimization
 * Shows a blurred placeholder while the full image loads
 * Automatically optimizes images via Cloudinary when configured
 */
export const LQIPImage = memo(function LQIPImage({
  src,
  alt,
  className,
  containerClassName,
  placeholderColor = 'hsl(var(--muted))',
  aspectRatio = 'video',
  priority = false,
  onLoad,
  width,
  height,
  optimize = {},
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}: LQIPImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [failed, setFailed] = useState(!isPlausibleImageUrl(src));
  const containerRef = useRef<HTMLDivElement>(null);

  // Memoize optimized image URLs
  const { optimizedSrc, srcSet, usesCDN } = useMemo(() => {
    const cloudinaryEnabled = isCloudinaryConfigured();
    
    if (!cloudinaryEnabled) {
      return { optimizedSrc: src, srcSet: '', usesCDN: false };
    }

    const options: CloudinaryOptions = {
      format: 'auto',
      quality: 'auto',
      dpr: 'auto',
      ...optimize,
      ...(width && { width }),
      ...(height && { height }),
    };

    return {
      optimizedSrc: optimizeImage(src, options),
      srcSet: generateSrcSet(src, [320, 640, 768, 1024, 1280], options),
      usesCDN: true,
    };
  }, [src, width, height, optimize]);

  useEffect(() => {
    setFailed(!isPlausibleImageUrl(src));
    setIsLoaded(false);
  }, [src]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.01 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '3/2': 'aspect-[3/2]',
    auto: '',
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        aspectClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Animated gradient placeholder */}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-700',
          isLoaded ? 'opacity-0' : 'opacity-100'
        )}
        style={{ backgroundColor: placeholderColor }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-highlight/5 via-muted/30 to-highlight/5" />
        <div 
          className="absolute inset-0 animate-pulse"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }}
        />
        
        {/* Subtle pattern overlay for visual interest */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Actual image - only render when in view; failed loads show a branded placeholder, never a broken icon. */}
      {failed ? (
        <CoverPlaceholder className="absolute inset-0" />
      ) : isInView && (
        <picture>
          {/* WebP source for browsers that support it (handled by Cloudinary's f_auto) */}
          <img
            src={optimizedSrc}
            srcSet={srcSet || undefined}
            sizes={usesCDN ? sizes : undefined}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            onLoad={handleLoad}
            onError={() => setFailed(true)}
            ref={(img) => {
              if (img && img.complete && img.naturalWidth === 0 && img.getAttribute('src')) setFailed(true);
            }}
            className={cn(
              'w-full h-full object-cover transition-all duration-700',
              isLoaded 
                ? 'opacity-100 blur-0 scale-100' 
                : 'opacity-0 blur-md scale-105',
              className
            )}
          />
        </picture>
      )}

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
});

export default LQIPImage;
