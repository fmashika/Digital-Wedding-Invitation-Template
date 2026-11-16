interface WeddingCardArtworkProps {
  compact?: boolean;
}

export function WeddingCardArtwork({ compact = false }: WeddingCardArtworkProps) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-white border border-[#DCE4EC] flex flex-col items-center justify-center text-center select-none ${
        compact ? 'h-full px-4 py-3 sm:px-5 sm:py-6' : 'aspect-[5/7] px-5 py-8 sm:px-8 sm:py-12'
      }`}
    >
      {/* Ice-slate watercolor edge washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 68% 42% at 6% 4%, rgba(74, 108, 138, 0.36) 0%, rgba(143, 173, 198, 0.18) 42%, transparent 74%)',
            'radial-gradient(ellipse 52% 34% at 24% 12%, rgba(116, 149, 178, 0.24) 0%, transparent 68%)',
            'radial-gradient(ellipse 70% 44% at 94% 95%, rgba(74, 108, 138, 0.34) 0%, rgba(143, 173, 198, 0.16) 44%, transparent 76%)',
            'radial-gradient(ellipse 46% 32% at 78% 86%, rgba(125, 158, 187, 0.22) 0%, transparent 66%)',
          ].join(', '),
        }}
      />

      <div className="relative z-10 max-w-xs mx-auto flex flex-col items-center">
        <p
          className={`text-[#334A60] leading-snug sm:leading-relaxed ${
            compact ? 'text-[9px] sm:text-[10px]' : 'text-xs sm:text-sm'
          }`}
        >
          Together with their families,
          <br />
          you&rsquo;re invited to celebrate the love of
        </p>

        <h3
          className={`font-display tracking-[0.14em] text-[#23374B] font-normal uppercase ${
            compact ? 'mt-2 sm:mt-3 text-xl sm:text-2xl' : 'mt-5 sm:mt-6 text-3xl sm:text-[2.65rem]'
          }`}
        >
          Pinniel
        </h3>

        <div
          className={`flex items-center justify-center gap-3 w-full ${
            compact ? 'my-1 sm:my-1.5' : 'my-2.5 sm:my-3'
          }`}
        >
          <span className="h-px w-8 sm:w-10 bg-[#5B7A96]/60" />
          <span
            className={`font-display text-[#23374B] ${
              compact ? 'text-sm sm:text-base' : 'text-lg sm:text-xl'
            }`}
          >
            &amp;
          </span>
          <span className="h-px w-8 sm:w-10 bg-[#5B7A96]/60" />
        </div>

        <h3
          className={`font-display tracking-[0.14em] text-[#23374B] font-normal uppercase ${
            compact ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-[2.65rem]'
          }`}
        >
          Wema
        </h3>

        <p
          className={`font-display tracking-[0.12em] text-[#23374B] tabular-nums ${
            compact ? 'mt-2 sm:mt-3 text-base sm:text-lg' : 'mt-5 sm:mt-7 text-xl sm:text-[1.7rem]'
          }`}
        >
          12.11.27
        </p>

        <p
          className={`text-[#334A60] leading-snug sm:leading-relaxed ${
            compact ? 'mt-1 sm:mt-1.5 text-[9px] sm:text-[10px]' : 'mt-2.5 sm:mt-3 text-xs sm:text-sm'
          }`}
        >
          at two o&rsquo;clock in the afternoon
          <br />
          Opal Retreat
          <br />
          Tucson, Arizona
        </p>

        <p
          className={`font-display italic text-[#334A60] ${
            compact ? 'mt-2 sm:mt-3 text-xs sm:text-sm' : 'mt-5 sm:mt-7 text-base sm:text-xl'
          }`}
        >
          reception to follow
        </p>
      </div>
    </div>
  );
}
