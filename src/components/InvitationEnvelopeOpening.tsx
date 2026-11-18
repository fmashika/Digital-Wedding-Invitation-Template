import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { WeddingCardArtwork } from './WeddingCardArtwork';

interface InvitationEnvelopeOpeningProps {
  onOpened: () => void;
}

export function InvitationEnvelopeOpening({
  onOpened,
}: InvitationEnvelopeOpeningProps) {
  const [stage, setStage] = useState<'sealed' | 'opening' | 'done'>('sealed');
  const shouldReduceMotion = useReducedMotion();

  const handleBreakSeal = () => {
    if (stage !== 'sealed') return;
    setStage('opening');

    const totalDelay = shouldReduceMotion ? 220 : 1250;
    window.setTimeout(() => {
      setStage('done');
      onOpened();
    }, totalDelay);
  };

  if (stage === 'done') {
    return null;
  }

  const isOpening = stage === 'opening';

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isOpening ? 0 : 1 }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : 0.45,
        delay: shouldReduceMotion ? 0 : 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#EEF3F8] px-4 py-6 sm:py-8 min-h-dvh overflow-y-auto overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding Invitation Envelope"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(157,178,198,0.28),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(157,178,198,0.24),transparent_48%)]"
      />

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
        <p className="text-xs font-medium tracking-wide text-[#53667A] mb-4 sm:mb-6 text-center px-2">
          Pinniel &amp; Wema · December 11, 2027
        </p>

        <div
          className="relative w-full max-w-[460px] aspect-[4/3]"
          style={{ perspective: '1400px' }}
        >
          {/* Envelope Back Base */}
          <div className="absolute inset-0 rounded-2xl bg-[#E4ECF3] border border-[#CFDCE7] shadow-[0_24px_60px_-15px_rgba(26,43,60,0.22)]" />

          {/* Rising Inner Invitation Card */}
          <motion.div
            initial={{ y: 0, scale: 0.96, opacity: 0.95 }}
            animate={
              isOpening
                ? { y: shouldReduceMotion ? -12 : -72, scale: 1, opacity: 1 }
                : { y: 0, scale: 0.96, opacity: 0.95 }
            }
            transition={{
              duration: shouldReduceMotion ? 0.2 : 0.65,
              delay: shouldReduceMotion ? 0 : 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute inset-x-4 top-3 bottom-3 rounded-xl bg-white border border-[#DCE4EC] shadow-md overflow-hidden flex flex-col items-center justify-center"
          >
            <WeddingCardArtwork compact />
          </motion.div>

          {/* Left & Right Envelope Side Folds */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
          >
            <svg
              viewBox="0 0 460 345"
              preserveAspectRatio="none"
              className="w-full h-full block"
            >
              {/* Left Fold */}
              <polygon
                points="0,0 230,185 0,345"
                fill="#F4F7FA"
                stroke="#D6E1EB"
                strokeWidth="1"
              />
              {/* Right Fold */}
              <polygon
                points="460,0 230,185 460,345"
                fill="#EFF4F9"
                stroke="#D6E1EB"
                strokeWidth="1"
              />
              {/* Bottom Pocket Fold */}
              <polygon
                points="0,345 230,165 460,345"
                fill="#FFFFFF"
                stroke="#D6E1EB"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Addressee Line on Front Lower Pocket */}
          <motion.div
            animate={{ opacity: isOpening ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-x-0 bottom-2.5 sm:bottom-5 text-center px-3 sm:px-6"
          >
            <p className="font-display italic font-bold text-[11px] sm:text-[13px] leading-snug text-[#32495F]">
              Mr &amp; Mrs Mashika kindly welcome you to their Son&rsquo;s wedding
            </p>
            <p className="mt-1 text-[11px] sm:text-xs font-medium text-[#53667A]">
              Touch the sealing to open your invitation
            </p>
          </motion.div>

          {/* Top Triangular Flap */}
          <motion.div
            initial={{ rotateX: 0 }}
            animate={{ rotateX: isOpening ? -175 : 0 }}
            transition={{
              duration: shouldReduceMotion ? 0.15 : 0.55,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              transformOrigin: 'top center',
              backfaceVisibility: 'hidden',
            }}
            className="pointer-events-none absolute inset-x-0 top-0 h-[56%] z-20"
          >
            <svg
              viewBox="0 0 460 193"
              preserveAspectRatio="none"
              className="w-full h-full drop-shadow-[0_6px_12px_rgba(26,43,60,0.08)]"
            >
              <polygon
                points="0,0 460,0 230,188"
                fill="#FFFFFF"
                stroke="#D6E1EB"
                strokeWidth="1.2"
              />
              <polygon
                points="14,6 446,6 230,178"
                fill="none"
                stroke="#E8EFF5"
                strokeWidth="1"
              />
            </svg>
          </motion.div>

          {/* Interactive Glowing Wax Seal Button */}
          <motion.button
            type="button"
            onClick={handleBreakSeal}
            initial={{ scale: 1, opacity: 1 }}
            animate={
              isOpening
                ? { scale: 0.85, opacity: 0, y: -18 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            whileHover={isOpening ? undefined : { scale: 1.07 }}
            whileTap={isOpening ? undefined : { scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Click the glowing wax seal to open the wedding invitation"
            className="group absolute left-1/2 top-[53%] -translate-x-1/2 -translate-y-1/2 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#23374B]"
          >
            {/* Outer Luminous Seal Glow */}
            <motion.span
              aria-hidden="true"
              animate={
                shouldReduceMotion || isOpening
                  ? { opacity: 0.65, scale: 1 }
                  : { opacity: [0.5, 0.95, 0.5], scale: [0.97, 1.14, 0.97] }
              }
              transition={
                shouldReduceMotion || isOpening
                  ? { duration: 0.2 }
                  : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
              }
              className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,rgba(125,168,209,0.68)_0%,rgba(59,87,115,0.3)_40%,rgba(59,87,115,0.08)_60%,transparent_75%)] will-change-transform"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-1 rounded-full ring-2 ring-[#9FC2E3]/70 shadow-[0_0_24px_rgba(125,168,209,0.85)]"
            />

            <svg
              viewBox="0 0 120 120"
              className="relative w-full h-full drop-shadow-[0_0_18px_rgba(125,168,209,0.7)]"
              aria-hidden="true"
            >
              <defs>
                <radialGradient id="waxSlate" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#4A6E91" />
                  <stop offset="55%" stopColor="#23374B" />
                  <stop offset="100%" stopColor="#162433" />
                </radialGradient>
              </defs>
              {/* Organic Wax Edge */}
              <path
                d="M60,6 C71,6 79,11 88,15 C97,19 107,27 110,38 C113,48 115,57 112,68 C109,78 106,89 96,97 C87,104 75,112 62,113 C49,114 38,110 27,103 C17,97 10,87 8,75 C6,63 5,50 10,39 C15,28 22,18 33,13 C43,8 51,6 60,6 Z"
                fill="url(#waxSlate)"
                stroke="rgba(191,218,242,0.55)"
                strokeWidth="1.5"
              />
              {/* Inner Embossed Ring */}
              <circle
                cx="60"
                cy="60"
                r="40"
                fill="none"
                stroke="rgba(220,235,248,0.45)"
                strokeWidth="1.5"
              />
              <circle
                cx="60"
                cy="60"
                r="35"
                fill="none"
                stroke="rgba(13,22,31,0.45)"
                strokeWidth="1"
              />
              {/* Monogram */}
              <text
                x="60"
                y="62"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#FFFFFF"
                fontFamily="Cormorant Garamond, Georgia, serif"
                fontSize="24"
                fontWeight="500"
                letterSpacing="1.5"
              >
                P&amp;W
              </text>
              <text
                x="60"
                y="82"
                textAnchor="middle"
                fill="rgba(225,238,250,0.9)"
                fontFamily="Plus Jakarta Sans, sans-serif"
                fontSize="8"
                letterSpacing="1.4"
              >
                12.11.27
              </text>
            </svg>
          </motion.button>
        </div>

        {/* Digital Arrowheads Pointing Upward to the Glowing Seal */}
        <motion.div
          aria-hidden="true"
          animate={{ opacity: isOpening ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="mt-6 flex flex-col items-center pointer-events-none select-none"
        >
          <div className="flex flex-col items-center -space-y-2">
            {[0, 1, 2].map((index) => (
              <motion.svg
                key={index}
                viewBox="0 0 36 22"
                className="w-7 h-4 drop-shadow-[0_0_8px_rgba(91,122,150,0.55)]"
                animate={
                  shouldReduceMotion
                    ? { opacity: 0.85 }
                    : {
                        opacity: [0.25, 1, 0.25],
                        y: [4, -3, 4],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 1.5,
                        repeat: Infinity,
                        delay: (2 - index) * 0.22,
                        ease: 'easeInOut',
                      }
                }
              >
                <polygon
                  points="18,2 34,17 29,20 18,9 7,20 2,17"
                  fill="#23374B"
                />
                <polygon
                  points="18,4 30,16 28,17 18,7 8,17 6,16"
                  fill="#8CB4D9"
                />
              </motion.svg>
            ))}
          </div>
          <div className="mt-1.5 h-5 w-px bg-gradient-to-t from-transparent via-[#5B7A96] to-[#23374B]" />
        </motion.div>
      </div>
    </motion.div>
  );
}
