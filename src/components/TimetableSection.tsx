import { useState } from 'react';
import { Clock, MapPin, Printer } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

type TimetablePhase =
  | 'All'
  | 'Arrival'
  | 'Ceremony'
  | 'Reception'
  | 'Evening';

interface TimetableEntry {
  id: string;
  timeRange: string;
  duration: string;
  phase: Exclude<TimetablePhase, 'All'>;
  title: string;
  location: string;
  notes: string;
}

const WEDDING_TIMETABLE: TimetableEntry[] = [
  {
    id: 'tt-1',
    timeRange: '1:15 PM – 1:45 PM',
    duration: '30 min',
    phase: 'Arrival',
    title: 'Valet & Shuttle Arrival',
    location: 'North Courtyard Gate',
    notes: 'Complimentary valet parking and guest shuttle drop-off from partner hotels in Tucson.',
  },
  {
    id: 'tt-2',
    timeRange: '1:30 PM – 2:00 PM',
    duration: '30 min',
    phase: 'Arrival',
    title: 'QR Pass Check-In & Seating',
    location: 'North Limestone Courtyard',
    notes: 'Present your QR pass at the entrance scanner, receive your seating card, and enjoy chilled citrus water.',
  },
  {
    id: 'tt-3',
    timeRange: '2:00 PM – 2:45 PM',
    duration: '45 min',
    phase: 'Ceremony',
    title: 'Wedding Ceremony & Vows',
    location: 'Opal Archway Garden',
    notes: 'Processional begins promptly at 2:00 PM. Kindly keep phones tucked away during the ceremony.',
  },
  {
    id: 'tt-4',
    timeRange: '2:45 PM – 3:30 PM',
    duration: '45 min',
    phase: 'Ceremony',
    title: 'Recessional & Group Portraits',
    location: 'Olive Grove Pathway',
    notes: 'Immediate family and wedding party gather in the olive grove while guests head to the terrace.',
  },
  {
    id: 'tt-5',
    timeRange: '3:30 PM – 5:00 PM',
    duration: '90 min',
    phase: 'Reception',
    title: 'Cocktail Hour & Acoustic Strings',
    location: 'Reflecting Pool Terrace',
    notes: 'Sonoran botanical cocktails, seasonal hors d’oeuvres, and live string quartet.',
  },
  {
    id: 'tt-6',
    timeRange: '5:00 PM – 7:00 PM',
    duration: '120 min',
    phase: 'Reception',
    title: 'Candlelit Dinner & Toasts',
    location: 'Glass Pavilion',
    notes: 'Three-course plated dinner with wine pairings, welcome remarks, and family toasts.',
  },
  {
    id: 'tt-7',
    timeRange: '7:00 PM – 7:45 PM',
    duration: '45 min',
    phase: 'Evening',
    title: 'First Dance & Cake Cutting',
    location: 'Glass Pavilion Terrace',
    notes: 'First dance beneath string lights, parent dances, and espresso service.',
  },
  {
    id: 'tt-8',
    timeRange: '7:45 PM – 10:30 PM',
    duration: '165 min',
    phase: 'Evening',
    title: 'Dancing, Churro Cart & Sparkler Exit',
    location: 'Glass Pavilion & Courtyard',
    notes: 'Open dance floor, late-night churros at 9:15 PM, and final sparkler send-off at 10:30 PM.',
  },
];

const PHASES: TimetablePhase[] = [
  'All',
  'Arrival',
  'Ceremony',
  'Reception',
  'Evening',
];

export function TimetableSection() {
  const [selectedPhase, setSelectedPhase] = useState<TimetablePhase>('All');

  const filteredEntries =
    selectedPhase === 'All'
      ? WEDDING_TIMETABLE
      : WEDDING_TIMETABLE.filter((entry) => entry.phase === selectedPhase);

  return (
    <section
      id="timetable"
      className="bg-[#F8FAFC] border-t border-[#DCE4EC]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <ScrollReveal direction="left" distance={40} blur={10}>
            <p className="text-xs font-medium text-[#53667A]">
              Full Day-Of Itinerary · Saturday, December 11, 2027
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A2B3C] text-balance">
              Wedding Timetable
            </h2>
            <p className="mt-2 text-[15px] text-[#425569] max-w-2xl">
              From valet arrival through the final sparkler send-off, every moment at Opal Retreat is timed so you can relax and celebrate with us.
            </p>
          </ScrollReveal>

          <ScrollReveal
            direction="right"
            delay={0.08}
            distance={36}
            blur={8}
            className="flex flex-wrap items-center gap-3 self-start lg:self-auto"
          >
            <div
              role="tablist"
              aria-label="Filter wedding timetable by part of day"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EEF3F7] rounded-lg"
            >
              {PHASES.map((phase) => (
                <button
                  key={phase}
                  type="button"
                  role="tab"
                  aria-selected={selectedPhase === phase}
                  onClick={() => setSelectedPhase(phase)}
                  className={`px-3 py-2 min-h-[38px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedPhase === phase
                      ? 'bg-white text-[#1A2B3C] shadow-xs'
                      : 'text-[#53667A] hover:text-[#1A2B3C]'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 min-h-[40px] rounded-lg border border-[#DCE4EC] bg-white hover:bg-[#EEF3F7] text-xs font-medium text-[#1A2B3C] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Timetable
            </button>
          </ScrollReveal>
        </div>

        <div className="mt-10 rounded-2xl border border-[#DCE4EC] bg-white overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-3.5 border-b border-[#DCE4EC] bg-[#F8FAFC] text-xs font-medium text-[#53667A]">
            <div className="col-span-3">Time &amp; Duration</div>
            <div className="col-span-5">Moment &amp; Guest Notes</div>
            <div className="col-span-2">Phase</div>
            <div className="col-span-2">Location</div>
          </div>

          <div className="divide-y divide-[#EDF2F7]">
            {filteredEntries.map((entry, idx) => (
              <ScrollReveal
                key={`${selectedPhase}-${entry.id}`}
                direction={idx % 2 === 0 ? 'left' : 'right'}
                delay={0.04 * idx}
                distance={30}
                blur={8}
              >
                <div className="px-4 sm:px-6 py-5 grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-6 items-start hover:bg-[#F8FAFC]/70 transition-colors">
                  <div className="md:col-span-3 flex flex-wrap md:block items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#1A2B3C] tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-[#5B7A96] shrink-0" />
                      <span>{entry.timeRange}</span>
                    </div>
                    <p className="md:mt-1 text-xs text-[#53667A] md:pl-5 tabular-nums">
                      {entry.duration}
                    </p>
                  </div>

                  <div className="md:col-span-5">
                    <h3 className="font-display text-xl text-[#1A2B3C]">
                      {entry.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#425569]">
                      {entry.notes}
                    </p>
                  </div>

                  <div className="md:col-span-2 text-xs font-medium text-[#53667A] hidden md:block">
                    {entry.phase}
                  </div>

                  <div className="md:col-span-2 flex items-start gap-1.5 text-xs text-[#23374B] font-medium pt-1 md:pt-0">
                    <MapPin className="w-3.5 h-3.5 text-[#5B7A96] mt-0.5 shrink-0" />
                    <span>
                      <span className="md:hidden text-[#53667A] font-normal">
                        {entry.phase} ·{' '}
                      </span>
                      {entry.location}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
