import { useState } from 'react';
import {
  CheckCircle2,
  Printer,
  QrCode,
  Search,
  Send,
} from 'lucide-react';
import type { MealChoice, RsvpRecord } from '../types';
import { QrCodeCanvas } from './QrCodeCanvas';
import { ScrollReveal } from './ScrollReveal';

interface RsvpAndPassSectionProps {
  activePass: RsvpRecord | null;
  onRsvpCreated: (rsvp: RsvpRecord, allRsvps: RsvpRecord[]) => void;
  onSelectPass: (rsvp: RsvpRecord) => void;
  onJumpToScanner: (passCode: string) => void;
}

const MEAL_OPTIONS: Exclude<MealChoice, 'Not Attending'>[] = [
  'Sonoran Herb-Crusted Sea Bass',
  'Braised Beef Short Rib',
  'Charred Cauliflower Steak',
];

export function RsvpAndPassSection({
  activePass,
  onRsvpCreated,
  onSelectPass,
  onJumpToScanner,
}: RsvpAndPassSectionProps) {
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState(true);
  const [partySize, setPartySize] = useState(2);
  const [additionalGuests, setAdditionalGuests] = useState('');
  const [mealChoice, setMealChoice] = useState<
    Exclude<MealChoice, 'Not Attending'>
  >('Sonoran Herb-Crusted Sea Bass');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [songRequest, setSongRequest] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!guestName.trim() || !email.includes('@')) {
      setFormError('Please provide your full name and a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName.trim(),
          email: email.trim(),
          attending,
          partySize: attending ? partySize : 0,
          additionalGuests: additionalGuests.trim(),
          mealChoice,
          dietaryNotes: dietaryNotes.trim(),
          songRequest: songRequest.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFormError(data.error ?? 'Could not submit RSVP.');
        return;
      }
      onRsvpCreated(data.rsvp, data.db.rsvps);
      setFormSuccess(
        attending
          ? `RSVP confirmed for ${data.rsvp.guestName}. Your ceremony entry pass (${data.rsvp.passCode}) is ready.`
          : `Thank you for letting us know, ${data.rsvp.guestName}. We will miss celebrating with you.`
      );
    } catch {
      setFormError('Network error while saving your RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!lookupQuery.trim()) {
      setLookupError('Enter a name, email, or pass code (e.g., PASS-101).');
      return;
    }
    setLookingUp(true);
    try {
      const response = await fetch(
        `/api/rsvp/lookup?query=${encodeURIComponent(lookupQuery.trim())}`
      );
      const data = await response.json();
      if (!response.ok) {
        setLookupError(data.error ?? 'No invitation pass found.');
        return;
      }
      onSelectPass(data.rsvp);
    } catch {
      setLookupError('Unable to search guest passes right now.');
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <section id="rsvp" className="bg-white border-y border-[#DCE4EC]">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <ScrollReveal direction="left" distance={40} blur={10} className="max-w-2xl">
          <p className="text-xs font-medium text-[#53667A]">
            Kindly Respond by October 15, 2026
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A2B3C] text-balance">
            RSVP &amp; Ceremony Entry Pass
          </h2>
          <p className="mt-2 text-[15px] text-[#425569]">
            Submit your attendance details to receive an instant QR entry pass for seamless check-in at Opal Retreat.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <ScrollReveal direction="left" delay={0.06} distance={44} blur={10} className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-6 sm:p-8 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Camila Reyes"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="camila@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                Will you be attending?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAttending(true)}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    attending
                      ? 'border-[#23374B] bg-[#23374B] text-white'
                      : 'border-[#DCE4EC] bg-white text-[#1A2B3C] hover:bg-[#EEF3F7]'
                  }`}
                >
                  Joyfully Accepts
                </button>
                <button
                  type="button"
                  onClick={() => setAttending(false)}
                  className={`py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                    !attending
                      ? 'border-[#23374B] bg-[#23374B] text-white'
                      : 'border-[#DCE4EC] bg-white text-[#1A2B3C] hover:bg-[#EEF3F7]'
                  }`}
                >
                  Regretfully Declines
                </button>
              </div>
            </div>

            {attending && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                      Guests in Your Party
                    </label>
                    <select
                      value={partySize}
                      onChange={(e) => setPartySize(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                      Dinner Selection
                    </label>
                    <select
                      value={mealChoice}
                      onChange={(e) =>
                        setMealChoice(
                          e.target.value as Exclude<MealChoice, 'Not Attending'>
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    >
                      {MEAL_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {partySize > 1 && (
                  <div>
                    <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                      Additional Guest Name(s)
                    </label>
                    <input
                      type="text"
                      value={additionalGuests}
                      onChange={(e) => setAdditionalGuests(e.target.value)}
                      placeholder="Names of guests accompanying you"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                      Dietary Notes / Allergies
                    </label>
                    <input
                      type="text"
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                      placeholder="Gluten-free, nut allergy, etc."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#53667A] mb-1.5">
                      Reception Song Request
                    </label>
                    <input
                      type="text"
                      value={songRequest}
                      onChange={(e) => setSongRequest(e.target.value)}
                      placeholder="Track that brings you to the dance floor"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    />
                  </div>
                </div>
              </>
            )}

            {formError && (
              <p className="text-xs font-medium text-[#9B2C2C]">{formError}</p>
            )}

            {formSuccess && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#EEF6F2] border border-[#C6DFD1] text-xs text-[#1A4731]">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Saving RSVP...' : 'Confirm RSVP & Generate Entry Pass'}
            </button>
          </form>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.12} distance={44} blur={10} className="lg:col-span-5 space-y-6">
            <form
              onSubmit={handleLookup}
              className="rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-5"
            >
              <label className="block text-xs font-medium text-[#53667A] mb-2">
                Already RSVPed? Retrieve Your Ceremony Pass
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Name, email, or PASS-101"
                  className="flex-1 min-w-0 px-3.5 py-2 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                />
                <button
                  type="submit"
                  disabled={lookingUp}
                  className="px-4 py-2 rounded-lg border border-[#DCE4EC] bg-white text-xs font-medium text-[#1A2B3C] hover:bg-[#EEF3F7] inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  Find
                </button>
              </div>
              {lookupError && (
                <p className="mt-2 text-xs text-[#9B2C2C]">{lookupError}</p>
              )}
            </form>

            {activePass ? (
              <div className="rounded-2xl border border-[#DCE4EC] bg-white p-6 shadow-xs">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
                  <div>
                    <p className="text-xs text-[#53667A]">
                      Ceremony Entry Pass · Opal Retreat
                    </p>
                    <h3 className="mt-1 font-display text-2xl text-[#1A2B3C]">
                      {activePass.guestName}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-medium text-[#23374B] tabular-nums">
                    {activePass.passCode}
                  </span>
                </div>

                {activePass.attending ? (
                  <>
                    <div className="py-6 flex justify-center">
                      <QrCodeCanvas
                        passCode={activePass.passCode}
                        guestName={activePass.guestName}
                      />
                    </div>

                    <div className="border-t border-[#EDF2F7] pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#53667A]">Party Size</span>
                        <span className="font-medium text-[#1A2B3C] tabular-nums">
                          {activePass.partySize}{' '}
                          {activePass.partySize === 1 ? 'Guest' : 'Guests'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#53667A]">Assigned Table</span>
                        <span className="font-medium text-[#1A2B3C]">
                          {activePass.tableAssignment}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#53667A]">Dinner Selection</span>
                        <span className="font-medium text-[#1A2B3C] text-right">
                          {activePass.mealChoice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#53667A]">Entrance Status</span>
                        <span className="font-medium text-[#1A2B3C]">
                          {activePass.checkInStatus === 'checked_in'
                            ? 'Checked In'
                            : 'Ready for Check-In'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => onJumpToScanner(activePass.passCode)}
                        className="py-2.5 px-4 rounded-lg bg-[#23374B] text-white text-xs font-medium hover:bg-[#1A2B3C] inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        Scan at Entrance
                      </button>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="py-2.5 px-4 rounded-lg border border-[#DCE4EC] bg-[#F8FAFC] text-[#1A2B3C] text-xs font-medium hover:bg-[#EEF3F7] inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Pass
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="pt-4 text-sm text-[#425569]">
                    This RSVP is recorded as not attending. You can update your response anytime using the form.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#C7D3E0] bg-[#F8FAFC] p-8 text-center">
                <QrCode className="w-8 h-8 mx-auto text-[#5B7A96]" strokeWidth={1.5} />
                <p className="mt-3 font-display text-xl text-[#1A2B3C]">
                  Your QR Ceremony Pass Appears Here
                </p>
                <p className="mt-1 text-xs text-[#53667A]">
                  Complete the RSVP form or look up an existing guest pass (try PASS-101) to view your scannable entry pass.
                </p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
