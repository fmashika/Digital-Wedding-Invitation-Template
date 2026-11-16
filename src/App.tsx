import { useEffect, useState } from 'react';
import { ArrowRight, QrCode } from 'lucide-react';
import { CeremonySection } from './components/CeremonySection';
import { CheckInSection } from './components/CheckInSection';
import { CountdownSection } from './components/CountdownSection';
import { GallerySection } from './components/GallerySection';
import { InvitationEnvelopeOpening } from './components/InvitationEnvelopeOpening';
import { RegistrySection } from './components/RegistrySection';
import { ResilientImage } from './components/ResilientImage';
import { RsvpAndPassSection } from './components/RsvpAndPassSection';
import { ScrollReveal } from './components/ScrollReveal';
import { TimetableSection } from './components/TimetableSection';
import type {
  GiftContribution,
  RegistryItem,
  RsvpRecord,
  WeddingDatabase,
} from './types';

export default function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState<boolean>(false);
  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [contributions, setContributions] = useState<GiftContribution[]>([]);
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

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#F8FAFC] text-[#1A2B3C] ${
        !envelopeOpened ? 'h-screen overflow-hidden' : ''
      }`}
    >
      {!envelopeOpened && (
        <InvitationEnvelopeOpening onOpened={() => setEnvelopeOpened(true)} />
      )}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE4EC] no-print">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="font-display text-2xl font-medium tracking-tight text-[#1A2B3C] whitespace-nowrap shrink-0"
          >
            Millie &amp; Edgar
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#53667A]"
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
              href="#checkin"
              className="hover:text-[#1A2B3C] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Check-In
            </a>
          </nav>

          <div className="shrink-0">
            <a
              href="#rsvp"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#23374B] text-white text-xs font-medium hover:bg-[#1A2B3C] transition-colors whitespace-nowrap shrink-0"
            >
              Confirm RSVP
            </a>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1 overflow-x-hidden">
        <CountdownSection />

        <section className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <ScrollReveal direction="left" distance={44} blur={10} className="lg:col-span-6 flex flex-col justify-center py-4">
              <p className="text-xs font-medium tracking-wide text-[#53667A]">
                Together with their families · Saturday, November 14, 2026
              </p>

              <h1
                className="mt-4 font-display font-normal text-[#1A2B3C] leading-[1.06] tracking-tight text-balance"
                style={{ fontSize: 'clamp(2.5rem, 4.6vw, 4.15rem)' }}
              >
                Millie Rodriguez &amp; Edgar Arias
              </h1>

              <p className="mt-5 text-base leading-relaxed text-[#425569] max-w-xl">
                You are warmly invited to celebrate our wedding at two o’clock in the afternoon at{' '}
                <strong className="font-semibold text-[#1A2B3C]">
                  Opal Retreat
                </strong>{' '}
                in Tucson, Arizona, with cocktail hour and candlelit reception to follow.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href="#rsvp"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors whitespace-nowrap shrink-0"
                >
                  RSVP &amp; Get Entry Pass
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#checkin"
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#23374B] hover:text-[#1A2B3C] underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  <QrCode className="w-4 h-4" />
                  Ceremony Check-In
                </a>
              </div>

              <div className="mt-10 pt-6 border-t border-[#DCE4EC] flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#53667A]">
                <span>11.14.26</span>
                <span aria-hidden="true">·</span>
                <span>2:00 PM MST</span>
                <span aria-hidden="true">·</span>
                <span>Opal Retreat, Tucson, AZ</span>
                <span aria-hidden="true">·</span>
                <span>Desert Formal</span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.1} distance={44} blur={10} className="lg:col-span-6">
              <div className="h-[380px] sm:h-[460px] lg:h-full lg:min-h-[480px] rounded-2xl overflow-hidden border border-[#DCE4EC] bg-[#EEF3F7]">
                <ResilientImage
                  src="/src/assets/images/hero_couple_retreat_1794819811766.jpg"
                  alt="Millie Rodriguez and Edgar Arias walking hand in hand across the Opal Retreat courtyard in Tucson, Arizona"
                  fallbackTitle="Millie & Edgar · Opal Retreat"
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

        <GallerySection />

        {loading ? (
          <section className="max-w-6xl mx-auto px-6 py-20 text-center text-sm text-[#53667A]">
            Loading registry and guest passes...
          </section>
        ) : (
          <>
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
          </>
        )}
      </main>

      <footer className="border-t border-[#DCE4EC] bg-white no-print">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-display text-2xl text-[#1A2B3C]">
              Millie Rodriguez &amp; Edgar Arias
            </p>
            <p className="mt-1 text-xs text-[#53667A]">
              November 14, 2026 · Opal Retreat · Tucson, Arizona
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#53667A]">
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
        </div>
      </footer>
    </div>
  );
}
