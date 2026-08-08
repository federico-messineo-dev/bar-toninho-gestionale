import React, { useRef, useState, useEffect } from 'react';

interface ScrollArrowsProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollArrows: React.FC<ScrollArrowsProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showRight, setShowRight] = useState(false);
  const [showLeft, setShowLeft] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
      setShowLeft(el.scrollLeft > 10);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  const scrollRight = () => ref.current?.scrollBy({ left: 300, behavior: 'smooth' });
  const scrollLeft = () => ref.current?.scrollBy({ left: -300, behavior: 'smooth' });

  return (
    <div className={`relative scroll-arrows-wrap ${className}`}>
      <div ref={ref} className="overflow-x-auto hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
      {showLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center z-10 cursor-pointer scroll-arrow-btn"
        >
          <span className="material-symbols-outlined text-on-surface/60 text-[28px] bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow-md border border-outline-variant/30">
            chevron_left
          </span>
        </button>
      )}
      {showRight && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center z-10 cursor-pointer scroll-arrow-btn"
        >
          <span className="material-symbols-outlined text-on-surface/60 text-[28px] bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow-md border border-outline-variant/30">
            chevron_right
          </span>
        </button>
      )}
    </div>
  );
};

export default ScrollArrows;
