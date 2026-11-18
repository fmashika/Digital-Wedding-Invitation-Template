import { memo, useEffect, useState } from 'react';
import { ScrollReveal } from './ScrollReveal';

const CEREMONY_TARGET = new Date('2027-12-11T14:00:00-07:00');

interface CalendarCountdown {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateCalendarCountdown(
  targetDate: Date,
  nowDate: Date
): CalendarCountdown {
  if (nowDate >= targetDate) {
    return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  let months =
    (targetDate.getFullYear() - nowDate.getFullYear()) * 12 +
    (targetDate.getMonth() - nowDate.getMonth());

  const candidate = new Date(nowDate.getTime());
  candidate.setMonth(candidate.getMonth() + months);

  if (candidate > targetDate) {
    months -= 1;
    candidate.setTime(nowDate.getTime());
    candidate.setMonth(candidate.getMonth() + months);
  }

  const remainingSeconds = Math.max(
    0,
    Math.floor((targetDate.getTime() - candidate.getTime()) / 1000)
  );

  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  return { months, days, hours, minutes, seconds };
}

function padTwo(val: number): string {
  return String(val).padStart(2, '0');
}

function LiveCountdownGrid() {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) {
        setNowMs(Date.now());
      }
    };
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const countdown = calculateCalendarCountdown(
    CEREMONY_TARGET,
    new Date(nowMs)
  );

  const units = [
    { label: 'Months', value: padTwo(countdown.months) },
    { label: 'Days', value: padTwo(countdown.days) },
    { label: 'Hours', value: padTwo(countdown.hours) },
    { label: 'Minutes', value: padTwo(countdown.minutes) },
    { label: 'Seconds', value: padTwo(countdown.seconds) },
  ];

  return (
    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-3.5">
      {units.map((unit, index) => (
        <div
          key={unit.label}
          className={`rounded-xl border border-[#DCE4EC] bg-[#F8FAFC] px-4 py-3 sm:py-3.5 flex items-baseline justify-between ${
            index === 0 ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <span className="font-display text-3xl sm:text-4xl text-[#1A2B3C] tabular-nums tracking-tight">
            {unit.value}
          </span>
          <span className="text-xs font-medium text-[#53667A]">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export const CountdownSection = memo(function CountdownSection() {
  return (
    <section
      aria-label="Ceremony Countdown"
      className="border-b border-[#DCE4EC] bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7">
        <ScrollReveal direction="left" distance={28} blur={4}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium tracking-wide text-[#53667A]">
                Countdown to December 2027 · Saturday, December 11, 2027 at 2:00 PM MST
              </p>
              <p className="font-display text-2xl text-[#1A2B3C]">
                Until we gather at Opal Retreat
              </p>
            </div>
            <p className="text-xs text-[#53667A] tabular-nums">
              Tucson, Arizona · Ceremony &amp; Reception
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.05} distance={20}>
          <LiveCountdownGrid />
        </ScrollReveal>
      </div>
    </section>
  );
});
