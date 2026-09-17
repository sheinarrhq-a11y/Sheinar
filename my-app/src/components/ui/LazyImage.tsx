import { useState, useRef, useEffect } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
}

export function LazyImage({ src, alt, className = "", wrapperClassName = "", ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* Shimmer placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {inView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
          {...props}
        />
      )}

      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
