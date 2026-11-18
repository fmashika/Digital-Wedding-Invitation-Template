import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, QrCode, X } from 'lucide-react';
import { CeremonySection } from './components/CeremonySection';
import { CountdownSection } from './components/CountdownSection';
import { InvitationEnvelopeOpening } from './components/InvitationEnvelopeOpening';
import { ResilientImage } from './components/ResilientImage';
import { ReturnToTopRings } from './components/ReturnToTopRings';
import { ScrollReveal } from './components/ScrollReveal';
import { TimetableSection } from './components/TimetableSection';
import type {
  GiftContribution,
  GuestbookWish,
  RegistryItem,
  RsvpRecord,
  WeddingDatabase,
} from './types';

const GallerySection = lazy(() =>
  import('./components/GallerySection').then((m) => ({ default: m.GallerySection }))
);
const RegistrySection = lazy(() =>
  import('./components/RegistrySection').then((m) => ({ default: m.RegistrySection }))
);
const RsvpAndPassSection = lazy(() =>
  import('./components/RsvpAndPassSection').then((m) => ({
    default: m.RsvpAndPassSection,
  }))
);
const GuestbookSection = lazy(() =>
  import('./components/GuestbookSection').then((m) => ({
    default: m.GuestbookSection,
  }))
);
const CheckInSection = lazy(() =>
  import('./components/CheckInSection').then((m) => ({ default: m.CheckInSection }))
);

export default function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showReturnRings, setShowReturnRings] = useState<boolean>(false);
  const [isPullingToTop, setIsPullingToTop] = useState<boolean>(false);
  const pullRafRef = useRef<number | null>(null);
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [contributions, setContributions] = useState<GiftContribution[]>([]);
  const [guestbookWishes, setGuestbookWishes] = useState<GuestbookWish[]>([]);
  const [activePass, setActivePass] = useState<RsvpRecord | null>(null);
  const [scannerPrefillCode, setScannerPrefillCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  useEffect(() => {
    let active = true;
    fetch('/api/wedding-data')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load wedding data.');
        return (await res.json()) as WeddingDatabase;
      })
      .then((data) => {
        if (!active) return;
        setRsvps(data.rsvps);
        setRegistryItems(data.registryItems);
        setContributions(data.contributions);
        setGuestbookWishes(data.guestbookWishes ?? []);
        if (data.rsvps.length > 0) {
          setActivePass(data.rsvps[0]);
        }
      })
      .catch(() => {
        if (active) {
          setLoadError('Unable to load invitation details. Please refresh.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRsvpCreated = (created: RsvpRecord, allRsvps: RsvpRecord[]) => {
    setRsvps(allRsvps);
    setActivePass(created);
  };

  const handleContributionSuccess = (
    _contribution: GiftContribution,
    updatedItems: RegistryItem[],
    updatedContributions: GiftContribution[]
  ) => {
    setRegistryItems(updatedItems);
    setContributions(updatedContributions);
  };

  const handleJumpToScanner = (passCode: string) => {
    setScannerPrefillCode(passCode);
    const el = document.getElementById('checkin');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!envelopeOpened) {
      setShowReturnRings(false);
      return;
    }

    let rafId: number | null = null;

    const updateScrollPosition = () => {
      rafId = null;
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportBottom = scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const nearEnd = scrollY > 360 && viewportBottom >= docHeight - 480;

      if (scrollY <= 120) {
        setShowReturnRings((prev) => (prev ? false : prev));
      } else if (!isPullingToTop) {
        setShowReturnRings((prev) => (prev === nearEnd ? prev : nearEnd));
      }
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(updateScrollPosition);
    };

    updateScrollPosition();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [envelopeOpened, isPullingToTop]);

  useEffect(() => {
    return () => {
      if (pullRafRef.current !== null) {
        cancelAnimationFrame(pullRafRef.current);
      }
    };
  }, []);

  const handlePullToTop = useCallback(() => {
    if (pullRafRef.current !== null) {
      cancelAnimationFrame(pullRafRef.current);
    }

    const startY = window.scrollY || window.pageYOffset;
    if (startY <= 0) {
      setIsPullingToTop(false);
      setShowReturnRings(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setIsPullingToTop(false);
      setShowReturnRings(false);
      return;
    }

    setIsPullingToTop(true);
    const durationMs = 460;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextY = Math.round(startY * (1 - eased));

      window.scrollTo({ top: nextY, behavior: 'instant' });

      if (progress < 1) {
        pullRafRef.current = requestAnimationFrame(step);
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        pullRafRef.current = null;
        setIsPullingToTop(false);
        setShowReturnRings(false);
      }
    };

    pullRafRef.current = requestAnimationFrame(step);
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F8FAFC] text-[#1A2B3C] ${
        !envelopeOpened ? 'h-screen overflow-hidden' : ''
      }`}
    >
      {!envelopeOpened && (
        <InvitationEnvelopeOpening onOpened={() => setEnvelopeOpened(true)} />
      )}
      <header className="sticky top-0 z-40 bg-white/97 border-b border-[#DCE4EC] no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          <a
            href="#top"
            className="font-display text-xl sm:text-2xl font-medium tracking-tight text-[#1A2B3C] whitespace-nowrap shrink-0"
          >
            Pinniel &amp; Wema
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-4 lg:gap-7 text-sm font-medium text-[#53667A]"
          >
            <a
              href="#ceremony"
              className="hover:text-[#1A2B3C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ceremony
            </a>
            <a
              href="#timetable"
              className="hover:text-[#1A2B3C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Timetable
            </a>
            <a
              href="#gallery"
              className="hover:text-[#1A2B3C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Gallery
            </a>
            <a
              href="#registry"
              className="hover:text-[#1A2B3C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Registry
            </a>
            <a
              href="#guestbook"
              className="hover:text-[#1A2B3C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Guestbook
            </a>
            <a
              href="#checkin"
              className="hover:text-[#1A2B3C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Check-In
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="#rsvp"
              className="inline-flex items-center px-3.5 sm:px-4 py-2 min-h-[40px] rounded-lg bg-[#23374B] text-white text-xs font-medium hover:bg-[#1A2B3C] transition-colors whitespace-nowrap shrink-0"
            >
              Confirm RSVP
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#DCE4EC] bg-white text-[#1A2B3C] hover:bg-[#EEF3F7] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-[#DCE4EC] bg-white px-4 py-3 flex flex-col gap-1 shadow-lg"
          >
            {[
              { href: '#ceremony', label: 'Ceremony Details' },
              { href: '#timetable', label: 'Wedding Timetable' },
              { href: '#gallery', label: 'Photo Gallery' },
              { href: '#registry', label: 'Gift Registry & Payment' },
              { href: '#rsvp', label: 'RSVP & Entry Pass' },
              { href: '#guestbook', label: 'Digital Guestbook' },
              { href: '#checkin', label: 'Ceremony Check-In' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A2B3C] hover:bg-[#EEF3F7] flex items-center justify-between transition-colors"
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 text-[#5B7A96]" />
              </a>
            ))}
          </nav>
        )}
      </header>

      <main
        id="top"
        className={`flex-1 overflow-x-clip ${
          isPullingToTop
            ? 'blur-[6px] -translate-y-2 transition-[filter,transform] duration-200 ease-out'
            : ''
        }`}
      >
        <CountdownSection />

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-stretch">
            <ScrollReveal direction="left" distance={44} blur={10} className="lg:col-span-6 flex flex-col justify-center py-4">
              <p className="text-xs font-medium tracking-wide text-[#53667A]">
                Together with their families · Saturday, December 11, 2027
              </p>

              <h1
                className="mt-4 font-display font-normal text-[#1A2B3C] leading-[1.06] tracking-tight text-balance"
                style={{ fontSize: 'clamp(2.5rem, 4.6vw, 4.15rem)' }}
              >
                Pinniel &amp; Wema
              </h1>

              <p className="mt-5 text-base leading-relaxed text-[#425569] max-w-xl">
                You are warmly invited to celebrate our wedding at two o’clock in the afternoon at{' '}
                <strong className="font-semibold text-[#1A2B3C]">
                  Opal Retreat
                </strong>{' '}
                in Tucson, Arizona, with cocktail hour and candlelit reception to follow.
              </p>

              <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
                <a
                  href="#rsvp"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 min-h-[44px] rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors whitespace-nowrap shrink-0"
                >
                  RSVP &amp; Get Entry Pass
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#checkin"
                  className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#23374B] hover:text-[#1A2B3C] underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  Ceremony Check-In
                </a>
              </div>

              <div className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-[#DCE4EC] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#53667A]">
                <span>12.11.27</span>
                <span aria-hidden="true">·</span>
                <span>2:00 PM MST</span>
                <span aria-hidden="true">·</span>
                <span>Opal Retreat, Tucson, AZ</span>
                <span aria-hidden="true">·</span>
                <span>Desert Formal</span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1} distance={44} blur={10} className="lg:col-span-6">
              <div className="h-[290px] sm:h-[420px] lg:h-full lg:min-h-[480px] rounded-2xl overflow-hidden border border-[#DCE4EC] bg-[#EEF3F7]">
                <ResilientImage
                  src="/src/assets/images/hero_couple_retreat_1794819811766.jpg"
                  alt="Pinniel and Wema walking hand in hand across the Opal Retreat courtyard in Tucson, Arizona"
                  fallbackTitle="Pinniel & Wema · Opal Retreat"
                  loading="eager"
                  fetchPriority="high"
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>

        {loadError && (
          <div className="max-w-6xl mx-auto px-6 pt-8">
            <p className="text-sm text-[#9B2C2C] bg-[#FDF2F2] border border-[#F2CACA] rounded-xl px-4 py-3">
              {loadError}
            </p>
          </div>
        )}

        <CeremonySection />

        <TimetableSection />

        <Suspense
          fallback={
            <section className="max-w-6xl mx-auto px-6 py-16 text-center text-sm text-[#53667A]">
              Loading gallery...
            </section>
          }
        >
          <GallerySection />
        </Suspense>

        {loading ? (
          <section className="max-w-6xl mx-auto px-6 py-20 text-center text-sm text-[#53667A]">
            Loading registry and guest passes...
          </section>
        ) : (
          <Suspense
            fallback={
              <section className="max-w-6xl mx-auto px-6 py-16 text-center text-sm text-[#53667A]">
                Loading wedding sections...
              </section>
            }
          >
            <RegistrySection
              items={registryItems}
              contributions={contributions}
              onContributionSuccess={handleContributionSuccess}
            />

            <RsvpAndPassSection
              activePass={activePass}
              onRsvpCreated={handleRsvpCreated}
              onSelectPass={(rsvp) => setActivePass(rsvp)}
              onJumpToScanner={handleJumpToScanner}
            />

            <GuestbookSection
              wishes={guestbookWishes}
              onWishAdded={(_wish, allWishes) => setGuestbookWishes(allWishes)}
            />

            <CheckInSection
              rsvps={rsvps}
              prefilledCode={scannerPrefillCode}
              onCheckInUpdated={(updated) => {
                setRsvps(updated);
                if (activePass) {
                  const refreshed = updated.find(
                    (r) => r.passCode === activePass.passCode
                  );
                  if (refreshed) setActivePass(refreshed);
                }
              }}
            />
          </Suspense>
        )}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 flex justify-end sticky bottom-5 z-40 pointer-events-none no-print">
          <div className="pointer-events-auto">
            <ReturnToTopRings
              visible={envelopeOpened && showReturnRings && !isPullingToTop}
              onPullToTop={handlePullToTop}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#DCE4EC] bg-white no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-2xl text-[#1A2B3C]">
              Pinniel &amp; Wema
            </p>
            <p className="mt-1 text-xs text-[#53667A]">
              December 11, 2027 · Opal Retreat · Tucson, Arizona
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#53667A]">
              <a href="#ceremony" className="hover:text-[#1A2B3C]">
                Ceremony
              </a>
              <a href="#timetable" className="hover:text-[#1A2B3C]">
                Timetable
              </a>
              <a href="#gallery" className="hover:text-[#1A2B3C]">
                Gallery
              </a>
              <a href="#registry" className="hover:text-[#1A2B3C]">
                Registry
              </a>
              <a href="#rsvp" className="hover:text-[#1A2B3C]">
                RSVP
              </a>
              <a href="#guestbook" className="hover:text-[#1A2B3C]">
                Guestbook
              </a>
              <a href="#checkin" className="hover:text-[#1A2B3C]">
                Check-In
              </a>
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  setEnvelopeOpened(false);
                }}
                className="hover:text-[#1A2B3C] underline underline-offset-4 cursor-pointer"
              >
                Replay Envelope
              </button>
            </div>

            <p className="text-xs text-[#53667A]">
              Designed by{' '}
              <a
                href="https://profadiztech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#23374B] hover:text-[#1A2B3C] underline underline-offset-4 transition-colors"
              >
                ProFadiz Tech
              </a>
            </p>
          </div>
        </div>
      </footer>

      {isPullingToTop && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-30 pointer-events-none bg-white/15 backdrop-blur-[3px]"
        />
      )}
    </div>
  );
}
