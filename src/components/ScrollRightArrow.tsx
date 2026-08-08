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
      <div ref={ref} className="overflow-x-auto hide-scrollbar">
        {children}
      </div>
      {showArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-end pr-1 bg-gradient-to-l from-[#FEF9EF] via-[#FEF9EF] to-transparent to-60% pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity z-10 cursor-pointer pointer-events-auto"
        >
          <span className="material-symbols-outlined text-on-surface/60 text-[28px] bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow-sm">
            chevron_right
          </span>
        </button>
      )}
    </div>
  );
};

export default ScrollRightArrow;
