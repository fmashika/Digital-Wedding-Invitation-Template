import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const TARGET_VOLUME = 0.42;

export function BackgroundAudioToggle() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cancelFade = () => {
    if (fadeRafRef.current !== null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelFade();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const rampVolume = (
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number,
    onDone?: () => void
  ) => {
    cancelFade();
    const startTime = performance.now();
    audio.volume = from;

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      audio.volume = from + (to - from) * progress;
      if (progress < 1) {
        fadeRafRef.current = requestAnimationFrame(step);
      } else {
        fadeRafRef.current = null;
        onDone?.();
      }
    };

    fadeRafRef.current = requestAnimationFrame(step);
  };

  const handleToggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setErrorMsg('');

    if (isPlaying && !isMuted) {
      setIsMuted(true);
      rampVolume(audio, audio.volume, 0, 260, () => {
        audio.muted = true;
        audio.pause();
        setIsPlaying(false);
      });
      return;
    }

    try {
      audio.muted = false;
      setIsMuted(false);
      if (audio.paused) {
        audio.volume = 0;
        await audio.play();
      }
      setIsPlaying(true);
      rampVolume(audio, audio.volume, TARGET_VOLUME, 450);
    } catch {
      setIsPlaying(false);
      setErrorMsg('Tap again to enable audio');
    }
  };

  const active = isPlaying && !isMuted;

  return (
    <div className="relative inline-flex items-center no-print">
      <audio
        ref={audioRef}
        src="/src/assets/audio/wedding_ambient.mp3"
        loop
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={active}
        aria-label={
          active
            ? 'Mute background wedding music'
            : 'Play background wedding music'
        }
        title={active ? 'Mute ambient wedding music' : 'Play ambient wedding music'}
        className={`inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2 min-h-[40px] min-w-[44px] rounded-lg border text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          active
            ? 'border-[#9DB2C6] bg-[#EEF3F7] text-[#1A2B3C] hover:bg-[#E4ECF3]'
            : 'border-[#DCE4EC] bg-white text-[#425569] hover:bg-[#F8FAFC] hover:text-[#1A2B3C]'
        }`}
      >
        {active ? (
          <Volume2 className="w-4 h-4 text-[#23374B] shrink-0" />
        ) : (
          <VolumeX className="w-4 h-4 text-[#53667A] shrink-0" />
        )}
        <span className="hidden sm:inline">
          {active ? 'Music On' : 'Music Off'}
        </span>
      </button>

      {errorMsg && (
        <span className="sr-only" role="status">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
