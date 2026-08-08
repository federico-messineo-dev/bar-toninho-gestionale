import React, { useRef, useState, useEffect } from 'react';

interface ScrollRightArrowProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollRightArrow: React.FC<ScrollRightArrowProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [showArrow, setShowArrow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setShowArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    check();
    el.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check); };
  }, []);

  const scrollRight = () => ref.current?.scrollBy({ left: 300, behavior: 'smooth' });

  return (
    <div className={`relative group/scroll ${className}`}>
      <div ref={ref} className="overflow-x-auto hide-scrollbar pr-10">
        {children}
      </div>
      {showArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center opacity-0 group-hover/scroll:opacity-100 transition-opacity z-10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-on-surface/60 text-[28px] bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow-md border border-outline-variant/30">
            chevron_right
          </span>
        </button>
      )}
    </div>
  );
};

export default ScrollRightArrow;
