import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

interface ReturnToTopRingsProps {
  visible: boolean;
  onPullToTop: () => void;
}

const MAX_SLIDE_PX = 104;
const MERGE_THRESHOLD_PX = 86;

export function ReturnToTopRings({
  visible,
  onPullToTop,
}: ReturnToTopRingsProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMerged, setIsMerged] = useState(false);

  const startClientXRef = useRef(0);
  const startDragXRef = useRef(0);
  const triggeredRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!visible) {
      setDragX(0);
      setIsDragging(false);
      setIsMerged(false);
      triggeredRef.current = false;
    }
  }, [visible]);

  const progress = Math.min(1, dragX / MAX_SLIDE_PX);

  const triggerMerge = () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setDragX(MAX_SLIDE_PX);
    setIsDragging(false);
    setIsMerged(true);

    window.setTimeout(
      () => {
        onPullToTop();
      },
      shouldReduceMotion ? 40 : 180
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isMerged || triggeredRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startClientXRef.current = e.clientX;
    startDragXRef.current = dragX;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || isMerged || triggeredRef.current) return;
    const delta = e.clientX - startClientXRef.current;
    const nextX = Math.max(0, Math.min(MAX_SLIDE_PX, startDragXRef.current + delta));
    setDragX(nextX);

    if (nextX >= MERGE_THRESHOLD_PX) {
      triggerMerge();
    }
  };

  const handlePointerUp = () => {
    if (!isDragging || isMerged || triggeredRef.current) return;
    setIsDragging(false);
    if (dragX >= MERGE_THRESHOLD_PX) {
      triggerMerge();
    } else {
      setDragX(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      e.preventDefault();
      triggerMerge();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 24, filter: 'blur(8px)' }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, y: 0, filter: 'blur(0px)' }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, y: 20, scale: 0.92, filter: 'blur(8px)' }
          }
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 no-print"
          role="region"
          aria-label="Merge rings to return to top"
        >
          <div className="rounded-2xl border border-[#DCE4EC] bg-white/95 backdrop-blur-md shadow-[0_14px_38px_-10px_rgba(26,43,60,0.28)] px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-medium text-[#53667A]">
                {isMerged ? 'Returning to top...' : 'Slide rings to merge'}
              </span>
              <span className="text-[11px] font-display italic text-[#23374B]">
                Top
              </span>
            </div>

            <div className="relative w-[148px] h-11 flex items-center select-none">
              {/* Track Line */}
              <div
                aria-hidden="true"
                className="absolute left-5 right-5 h-0.5 rounded-full bg-[#DCE4EC]"
              />
              <div
                aria-hidden="true"
                className="absolute left-5 h-0.5 rounded-full bg-[#5B7A96] transition-all duration-75"
                style={{ width: `${Math.round(progress * 108)}px` }}
              />

              {/* Stationary Target Ring (Right) */}
              <div
                aria-hidden="true"
                className="absolute right-0 w-11 h-11 flex items-center justify-center pointer-events-none"
              >
                <div
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-transform duration-200 ${
                    progress > 0.65 || isMerged ? 'scale-110' : 'scale-100'
                  }`}
                >
                  {(progress > 0.5 || isMerged) && (
                    <span className="absolute -inset-1 rounded-full bg-[#9FC2E3]/45 blur-xs" />
                  )}
                  <svg viewBox="0 0 40 40" className="relative w-9 h-9">
                    <defs>
                      <linearGradient id="ringSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E6EDF4" />
                        <stop offset="50%" stopColor="#6D8AA6" />
                        <stop offset="100%" stopColor="#23374B" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="20"
                      cy="20"
                      r="13"
                      fill="none"
                      stroke="url(#ringSilver)"
                      strokeWidth="4.2"
                    />
                    <circle
                      cx="20"
                      cy="10"
                      r="2.2"
                      fill="#FFFFFF"
                      stroke="#5B7A96"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
              </div>

              {/* Draggable Sliding Ring (Left) */}
              <button
                type="button"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown}
                aria-label="Slide ring right to merge with the second ring and return to the top"
                style={{
                  transform: `translate3d(${dragX}px, 0, 0)`,
                  transition: isDragging
                    ? 'none'
                    : 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center touch-none cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23374B]"
              >
                <svg
                  viewBox="0 0 40 40"
                  className="w-9 h-9 drop-shadow-[0_3px_8px_rgba(26,43,60,0.22)]"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ringGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5E4BE" />
                      <stop offset="48%" stopColor="#C9A25D" />
                      <stop offset="100%" stopColor="#8C6A2E" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="20"
                    cy="20"
                    r="13"
                    fill="none"
                    stroke="url(#ringGold)"
                    strokeWidth="4.2"
                  />
                  <polygon
                    points="20,4 23.5,8.5 20,12 16.5,8.5"
                    fill="#FFFFFF"
                    stroke="#C9A25D"
                    strokeWidth="1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
