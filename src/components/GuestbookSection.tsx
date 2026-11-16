import { useState } from 'react';
import { BookHeart, CheckCircle2, Send } from 'lucide-react';
import type { GuestbookWish } from '../types';
import { ScrollReveal } from './ScrollReveal';

interface GuestbookSectionProps {
  wishes: GuestbookWish[];
  onWishAdded: (wish: GuestbookWish, allWishes: GuestbookWish[]) => void;
}

const MAX_MESSAGE_LENGTH = 320;

function formatWishDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function GuestbookSection({ wishes, onWishAdded }: GuestbookSectionProps) {
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [recentWishId, setRecentWishId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedName = authorName.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setErrorMsg('Please enter your name before posting your wish.');
      return;
    }
    if (trimmedMessage.length < 3) {
      setErrorMsg('Please write a short congratulatory message for Pinniel & Wema.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: trimmedName,
          relationship: relationship.trim(),
          message: trimmedMessage,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error ?? 'Unable to post your wish right now.');
        return;
      }

      onWishAdded(data.wish, data.db.guestbookWishes);
      setRecentWishId(data.wish.id);
      setAuthorName('');
      setRelationship('');
      setMessage('');
      setSuccessMsg(
        `Thank you, ${data.wish.authorName}. Your wish has been added to Pinniel & Wema’s keepsake guestbook.`
      );
    } catch {
      setErrorMsg('Network error while saving your wish. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="guestbook"
      className="border-t border-[#DCE4EC] bg-white"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <ScrollReveal direction="left" distance={40} blur={10}>
            <p className="text-xs font-medium text-[#53667A]">
              Digital Guestbook &amp; Keepsake Wishes
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A2B3C] text-balance">
              Leave a Wish for Pinniel &amp; Wema
            </h2>
            <p className="mt-2 text-[15px] text-[#425569] max-w-2xl">
              Share a short congratulatory note, blessing, or memory for the couple to cherish long after the desert stars fade.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.08} distance={32} blur={8}>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#53667A] tabular-nums">
              <BookHeart className="w-4 h-4 text-[#5B7A96]" />
              <span>
                {wishes.length} {wishes.length === 1 ? 'Wish' : 'Wishes'} Recorded
              </span>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <ScrollReveal
            direction="left"
            distance={40}
            blur={10}
            className="lg:col-span-5"
          >
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#DCE4EC] bg-[#F8FAFC] p-5 sm:p-7 space-y-5"
            >
              <div>
                <h3 className="font-display text-2xl text-[#1A2B3C]">
                  Sign the Guestbook
                </h3>
                <p className="mt-1 text-xs text-[#53667A]">
                  Your note appears immediately below for everyone celebrating with us.
                </p>
              </div>

              <div>
                <label
                  htmlFor="guestbook-author-name"
                  className="block text-xs font-medium text-[#53667A] mb-1.5"
                >
                  Your Name
                </label>
                <input
                  id="guestbook-author-name"
                  type="text"
                  required
                  maxLength={80}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g., Naomi & David Okafor"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                />
              </div>

              <div>
                <label
                  htmlFor="guestbook-relationship"
                  className="block text-xs font-medium text-[#53667A] mb-1.5"
                >
                  How You Know the Couple (Optional)
                </label>
                <input
                  id="guestbook-relationship"
                  type="text"
                  maxLength={80}
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g., Childhood Friend · Tucson"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="guestbook-message"
                    className="block text-xs font-medium text-[#53667A]"
                  >
                    Congratulatory Message
                  </label>
                  <span className="text-[11px] font-mono text-[#53667A] tabular-nums">
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                <textarea
                  id="guestbook-message"
                  rows={4}
                  required
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Wishing you both a lifetime of love, laughter, and sunlit mornings together..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#DCE4EC] bg-white text-sm leading-relaxed text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B] resize-y"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-[#9B2C2C] bg-[#FDF2F2] border border-[#F2CACA] rounded-lg px-3.5 py-2.5">
                  {errorMsg}
                </p>
              )}

              {successMsg && (
                <div className="flex items-start gap-2.5 text-xs text-[#1A4731] bg-[#EEF6F2] border border-[#C6DFD1] rounded-lg px-3.5 py-2.5">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[44px] py-3 px-5 rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Posting Your Wish...' : 'Post Digital Wish'}
              </button>
            </form>
          </ScrollReveal>

          <ScrollReveal
            direction="right"
            delay={0.08}
            distance={40}
            blur={10}
            className="lg:col-span-7"
          >
            {wishes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#DCE4EC] bg-[#F8FAFC] p-8 sm:p-10 text-center">
                <p className="font-display text-2xl text-[#1A2B3C]">
                  Be the First to Leave a Wish
                </p>
                <p className="mt-2 text-sm text-[#53667A]">
                  Share a warm note for Pinniel &amp; Wema using the guestbook form.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {wishes.map((wish) => {
                  const isHighlighted = wish.id === recentWishId;
                  const formattedDate = formatWishDate(wish.createdAt);

                  return (
                    <article
                      key={wish.id}
                      className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
                        isHighlighted
                          ? 'border-[#5B7A96] bg-[#F4F8FB]'
                          : 'border-[#DCE4EC] bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="font-display text-4xl leading-none text-[#5B7A96] select-none shrink-0 -mt-1"
                        >
                          &ldquo;
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] leading-relaxed text-[#23374B] break-words">
                            {wish.message}
                          </p>

                          <div className="mt-4 pt-3 border-t border-[#EDF2F7] flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <div className="min-w-0">
                              <p className="font-display text-xl text-[#1A2B3C] leading-snug">
                                {wish.authorName}
                              </p>
                              {wish.relationship && (
                                <p className="text-xs text-[#53667A]">
                                  {wish.relationship}
                                </p>
                              )}
                            </div>

                            {formattedDate && (
                              <span className="text-xs font-mono text-[#53667A] shrink-0">
                                {formattedDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
