import { lazy, Suspense } from 'react';
import { Calendar, Clock, MapPin, Shirt } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { WeddingCardArtwork } from './WeddingCardArtwork';

const VenueMap = lazy(() =>
  import('./VenueMap').then((m) => ({ default: m.VenueMap }))
);

const TIMELINE_EVENTS = [
  {
    index: '01',
    title: 'Guest Arrival & QR Check-In',
    time: '1:30 PM',
    location: 'North Limestone Courtyard',
    description:
      'Present your digital RSVP pass at the courtyard entrance for seamless check-in, program booklets, and chilled citrus water.',
  },
  {
    index: '02',
    title: 'The Wedding Ceremony',
    time: '2:00 PM',
    location: 'Opal Archway Garden',
    description:
      'Pinniel and Wema exchange vows surrounded by family, desert olive trees, and mountain views.',
  },
  {
    index: '03',
    title: 'Cocktail Hour & Portraits',
    time: '3:30 PM',
    location: 'Reflecting Pool Terrace',
    description:
      'Acoustic string quartet, Sonoran botanical cocktails, and seasonal hors d’oeuvres overlooking the Catalina foothills.',
  },
  {
    index: '04',
    title: 'Candlelit Dinner & Reception',
    time: '5:00 PM – 10:30 PM',
    location: 'Glass Pavilion',
    description:
      'Seated three-course Sonoran dinner, heartfelt toasts, and dancing beneath the desert evening sky.',
  },
];

export function CeremonySection() {
  const handleDownloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Pinniel and Wema Wedding//EN',
      'BEGIN:VEVENT',
      'UID:pinniel-wema-2027-12-11@opalretreat.com',
      'DTSTAMP:20271211T210000Z',
      'DTSTART:20271211T210000Z',
      'DTEND:20271212T053000Z',
      'SUMMARY:Wedding of Pinniel & Wema',
      'LOCATION:Opal Retreat, 4800 N Sabino Canyon Rd, Tucson, AZ',
      'DESCRIPTION:Ceremony begins at 2:00 PM MST with reception to follow at Opal Retreat.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pinniel-wema-wedding-12-11-27.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="ceremony" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        <ScrollReveal direction="left" distance={44} blur={10} className="lg:col-span-5">
          <p className="text-xs font-medium text-[#53667A]">
            Official Invitation · Keepsake Edition
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A2B3C] text-balance">
            Ceremony &amp; Reception Details
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#425569]">
            We are honored to gather our favorite people in the Sonoran foothills for an afternoon ceremony and candlelit reception.
          </p>

          <div className="mt-8 rounded-2xl border border-[#DCE4EC] bg-white p-4 shadow-xs">
            <WeddingCardArtwork />
            <div className="mt-4 pt-3 border-t border-[#EDF2F7] flex items-center justify-between gap-4">
              <span className="text-xs text-[#53667A]">
                12.11.27 · 2:00 PM · Opal Retreat
              </span>
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#23374B] hover:text-[#1A2B3C] underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                Add to Calendar
              </button>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.08} distance={44} blur={10} className="lg:col-span-7 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-[#DCE4EC]">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#53667A]">
                <Clock className="w-4 h-4 text-[#23374B]" />
                <span>Date &amp; Time</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#1A2B3C]">
                Saturday, Dec 11, 2027
              </p>
              <p className="text-sm text-[#425569]">
                Doors 1:30 PM · Vows 2:00 PM
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#53667A]">
                <MapPin className="w-4 h-4 text-[#23374B]" />
                <span>Venue</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#1A2B3C]">
                Opal Retreat
              </p>
              <p className="text-sm text-[#425569]">
                4800 N Sabino Canyon Rd, Tucson, AZ
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-[#53667A]">
                <Shirt className="w-4 h-4 text-[#23374B]" />
                <span>Attire</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#1A2B3C]">
                Desert Formal
              </p>
              <p className="text-sm text-[#425569]">
                Slate, ivory, navy &amp; warm neutrals
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-2xl text-[#1A2B3C]">
              Afternoon Schedule
            </h3>
            <div className="mt-6 divide-y divide-[#DCE4EC] border-y border-[#DCE4EC]">
              {TIMELINE_EVENTS.map((event, idx) => (
                <ScrollReveal
                  key={event.index}
                  direction={idx % 2 === 0 ? 'right' : 'left'}
                  delay={0.06 * idx}
                  distance={28}
                  blur={8}
                >
                  <div className="py-5 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline">
                    <div className="sm:col-span-3 flex items-baseline gap-3">
                      <span className="font-mono text-xs text-[#5B7A96] tabular-nums">
                        {event.index}.
                      </span>
                      <span className="text-sm font-semibold text-[#1A2B3C] tabular-nums">
                        {event.time}
                      </span>
                    </div>
                    <div className="sm:col-span-9">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <h4 className="text-base font-semibold text-[#1A2B3C]">
                          {event.title}
                        </h4>
                        <span className="text-xs text-[#53667A]">
                          · {event.location}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#425569]">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <Suspense
            fallback={
              <div className="h-[340px] rounded-2xl border border-[#DCE4EC] bg-white flex items-center justify-center text-xs text-[#53667A]">
                Loading venue map...
              </div>
            }
          >
            <VenueMap />
          </Suspense>
        </ScrollReveal>
      </div>
    </section>
  );
}
