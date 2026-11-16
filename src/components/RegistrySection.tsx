import { useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Gift,
  Landmark,
  Lock,
  Receipt,
  Smartphone,
  X,
} from 'lucide-react';
import type {
  GiftContribution,
  PaymentMethod,
  RegistryCategory,
  RegistryItem,
} from '../types';
import { ResilientImage } from './ResilientImage';
import { ScrollReveal } from './ScrollReveal';

interface RegistrySectionProps {
  items: RegistryItem[];
  contributions: GiftContribution[];
  onContributionSuccess: (
    contribution: GiftContribution,
    updatedItems: RegistryItem[],
    updatedContributions: GiftContribution[]
  ) => void;
}

type CategoryFilter = 'All' | RegistryCategory;

const FILTER_OPTIONS: CategoryFilter[] = [
  'All',
  'Honeymoon',
  'Home & Kitchen',
  'Dining',
  'Experiences',
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; subtitle: string }[] = [
  { id: 'Card', label: 'Credit / Debit', subtitle: 'Instant card checkout' },
  { id: 'Apple Pay', label: 'Apple Pay', subtitle: 'One-tap express gift' },
  { id: 'Zelle', label: 'Zelle', subtitle: 'Zero-fee direct transfer' },
  { id: 'Bank Transfer', label: 'Bank ACH', subtitle: 'US checking transfer' },
];

export function RegistrySection({
  items,
  contributions,
  onContributionSuccess,
}: RegistrySectionProps) {
  const [filter, setFilter] = useState<CategoryFilter>('All');
  const [activeItem, setActiveItem] = useState<RegistryItem | null>(null);
  const [customFundOpen, setCustomFundOpen] = useState<boolean>(false);

  const [amount, setAmount] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [contributorName, setContributorName] = useState('');
  const [contributorEmail, setContributorEmail] = useState('');
  const [note, setNote] = useState('');

  // Card inputs
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvc, setCardCvc] = useState('842');
  // Bank ACH inputs
  const [bankAccountName, setBankAccountName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<GiftContribution | null>(null);

  const visibleItems =
    filter === 'All'
      ? items
      : items.filter((item) => item.category === filter);

  const totalGoal = items.reduce((sum, item) => sum + item.goalAmount, 0);
  const totalRaised = items.reduce((sum, item) => sum + item.raisedAmount, 0);

  const openCheckout = (item: RegistryItem | null, isCustom = false) => {
    setErrorMsg('');
    setReceipt(null);
    if (isCustom) {
      setActiveItem(null);
      setCustomFundOpen(true);
      setAmount(150);
    } else if (item) {
      setCustomFundOpen(false);
      setActiveItem(item);
      const remaining = Math.max(25, item.goalAmount - item.raisedAmount);
      setAmount(Math.min(150, remaining));
    }
  };

  const closeCheckout = () => {
    setActiveItem(null);
    setCustomFundOpen(false);
    setReceipt(null);
    setErrorMsg('');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!contributorName.trim() || !contributorEmail.includes('@')) {
      setErrorMsg('Please enter your full name and a valid email address for the receipt.');
      return;
    }
    if (amount < 10) {
      setErrorMsg('Minimum gift contribution is $10.');
      return;
    }

    let accountSummary = 'Verified Payment';
    if (paymentMethod === 'Card') {
      const digits = cardNumber.replace(/\D/g, '');
      const last4 = digits.slice(-4) || '4242';
      accountSummary = `Card •••• ${last4}`;
    } else if (paymentMethod === 'Apple Pay') {
      accountSummary = 'Apple Pay Express';
    } else if (paymentMethod === 'Zelle') {
      accountSummary = 'Zelle @millie-edgar-2026';
    } else if (paymentMethod === 'Bank Transfer') {
      accountSummary = bankAccountName.trim()
        ? `ACH (${bankAccountName.trim()})`
        : 'Bank ACH Transfer';
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/registry/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: activeItem ? activeItem.id : 'custom-cash-fund',
          contributorName: contributorName.trim(),
          contributorEmail: contributorEmail.trim(),
          amount,
          paymentMethod,
          accountSummary,
          note: note.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error ?? 'Unable to complete gift payment.');
        return;
      }
      setReceipt(data.contribution);
      onContributionSuccess(
        data.contribution,
        data.db.registryItems,
        data.db.contributions
      );
      setNote('');
    } catch {
      setErrorMsg('Network error while processing payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isModalOpen = Boolean(activeItem || customFundOpen);

  return (
    <section id="registry" className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <ScrollReveal direction="left" distance={40} blur={10}>
          <p className="text-xs font-medium text-[#53667A]">
            Integrated Gift Registry &amp; Direct Payment
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A2B3C] text-balance">
            Gift Registry &amp; Honeymoon Fund
          </h2>
          <p className="mt-2 text-[15px] text-[#425569] max-w-2xl">
            Your presence in Tucson is the greatest gift. For friends and family wishing to contribute toward our home or Amalfi Coast honeymoon, you can select any registry item and pay directly below.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.08} distance={32} blur={8} className="self-start lg:self-auto">
          <button
            type="button"
            onClick={() => openCheckout(null, true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            Send Cash Gift
          </button>
        </ScrollReveal>
      </div>

      <ScrollReveal direction="up" delay={0.05} distance={28} blur={8}>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-[#DCE4EC] py-5">
        <div>
          <p className="text-xs text-[#53667A]">Total Registry Progress</p>
          <p className="mt-1 font-display text-2xl text-[#1A2B3C] tabular-nums">
            ${totalRaised.toLocaleString()}{' '}
            <span className="text-base font-sans text-[#53667A]">
              of ${totalGoal.toLocaleString()}
            </span>
          </p>
        </div>
        <div>
          <p className="text-xs text-[#53667A]">Verified Gift Payments</p>
          <p className="mt-1 font-display text-2xl text-[#1A2B3C] tabular-nums">
            {contributions.length} Contributions
          </p>
        </div>
        <div>
          <p className="text-xs text-[#53667A]">Accepted Payment Methods</p>
          <p className="mt-1 text-sm font-medium text-[#1A2B3C]">
            Card · Apple Pay · Zelle · Bank Transfer
          </p>
        </div>
      </div>
      </ScrollReveal>

      <ScrollReveal direction="left" delay={0.05} distance={32} blur={8}>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Filter gift registry"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EEF3F7] rounded-lg"
        >
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              onClick={() => setFilter(option)}
              className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === option
                  ? 'bg-white text-[#1A2B3C] shadow-xs'
                  : 'text-[#53667A] hover:text-[#1A2B3C]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      </ScrollReveal>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleItems.map((item, idx) => {
          const pct = Math.min(
            100,
            Math.round((item.raisedAmount / item.goalAmount) * 100)
          );
          const isFunded = item.raisedAmount >= item.goalAmount;
          const remaining = Math.max(0, item.goalAmount - item.raisedAmount);
          const dir = idx % 3 === 0 ? 'left' : idx % 3 === 2 ? 'right' : 'up';

          return (
            <ScrollReveal
              key={`${filter}-${item.id}`}
              direction={dir}
              delay={0.06 * idx}
              distance={36}
              blur={10}
              className="flex"
            >
              <article className="flex-1 flex flex-col rounded-2xl border border-[#DCE4EC] bg-white overflow-hidden">
              <div className="h-48 overflow-hidden bg-[#EEF3F7]">
                <ResilientImage
                  src={item.imageUrl}
                  alt={item.title}
                  fallbackTitle={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-[#53667A]">
                    {item.category} · {isFunded ? 'Fully Funded' : `$${remaining.toLocaleString()} remaining`}
                  </p>
                  <h3 className="mt-1.5 font-display text-2xl text-[#1A2B3C]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#425569]">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EDF2F7]">
                  <div className="flex items-baseline justify-between text-xs mb-2">
                    <span className="font-semibold text-[#1A2B3C] tabular-nums">
                      ${item.raisedAmount.toLocaleString()} contributed
                    </span>
                    <span className="text-[#53667A] tabular-nums">
                      Goal ${item.goalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#E6EDF4] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#23374B] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => openCheckout(item, false)}
                    className={`mt-5 w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isFunded
                        ? 'border border-[#DCE4EC] bg-[#F8FAFC] text-[#23374B] hover:bg-[#EEF3F7]'
                        : 'bg-[#23374B] text-white hover:bg-[#1A2B3C]'
                    }`}
                  >
                    {isFunded ? 'Add Bonus Contribution' : 'Contribute & Pay'}
                  </button>
                </div>
              </div>
            </article>
            </ScrollReveal>
          );
        })}
      </div>

      {contributions.length > 0 && (
        <ScrollReveal direction="right" distance={36} blur={10}>
          <div className="mt-14 rounded-2xl border border-[#DCE4EC] bg-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#DCE4EC]">
            <div>
              <h3 className="font-display text-2xl text-[#1A2B3C]">
                Recent Gift Contributions &amp; Payment Ledger
              </h3>
              <p className="text-xs text-[#53667A]">
                Verified receipts recorded for Millie &amp; Edgar
              </p>
            </div>
            <span className="text-xs font-mono text-[#53667A] tabular-nums">
              {contributions.length} Total Payments
            </span>
          </div>

          <div className="divide-y divide-[#EDF2F7]">
            {contributions.slice(0, 6).map((entry) => (
              <div
                key={entry.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1A2B3C]">
                    {entry.contributorName}{' '}
                    <span className="font-normal text-[#53667A]">
                      · {entry.itemTitle}
                    </span>
                  </p>
                  {entry.note && (
                    <p className="mt-1 text-sm text-[#425569] italic">
                      &ldquo;{entry.note}&rdquo;
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[#53667A]">
                    {entry.paymentMethod} ({entry.accountSummary}) · Ref{' '}
                    <span className="font-mono">{entry.referenceCode}</span>
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="font-display text-xl text-[#1A2B3C] tabular-nums">
                    ${entry.amount.toLocaleString()}
                  </span>
                  <p className="text-xs text-[#53667A]">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </ScrollReveal>
      )}

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gift Payment Checkout"
          className="fixed inset-0 z-50 bg-[#0E1924]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeCheckout}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl border border-[#DCE4EC] shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE4EC] bg-[#F8FAFC]">
              <div>
                <p className="text-xs text-[#53667A]">
                  Millie &amp; Edgar Registry Payment
                </p>
                <h3 className="font-display text-2xl text-[#1A2B3C]">
                  {activeItem ? activeItem.title : 'Honeymoon & Home Cash Gift'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                aria-label="Close payment window"
                className="p-2 rounded-lg text-[#53667A] hover:text-[#1A2B3C] hover:bg-[#E8EFF6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {receipt ? (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-[#EEF6F2] border border-[#C6DFD1] text-[#1A4731]">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">
                      Payment Confirmed · Reference {receipt.referenceCode}
                    </p>
                    <p className="mt-1 text-xs">
                      Thank you, {receipt.contributorName}. A confirmation receipt has been recorded for {receipt.contributorEmail}.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#DCE4EC] bg-[#F8FAFC] p-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#53667A] pb-2 border-b border-[#DCE4EC]">
                    <Receipt className="w-4 h-4" />
                    <span>Itemized Gift Receipt</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#53667A]">Registry Gift</span>
                    <span className="font-medium text-[#1A2B3C] text-right">
                      {receipt.itemTitle}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#53667A]">Payment Method</span>
                    <span className="font-medium text-[#1A2B3C]">
                      {receipt.paymentMethod} · {receipt.accountSummary}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#DCE4EC]">
                    <span className="font-semibold text-[#1A2B3C]">Total Paid</span>
                    <span className="font-display text-2xl text-[#1A2B3C] tabular-nums">
                      ${receipt.amount.toLocaleString()}.00
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="w-full py-3 px-5 rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors cursor-pointer"
                >
                  Return to Wedding Registry
                </button>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#53667A] mb-2">
                    Select Gift Amount
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[50, 100, 250, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors tabular-nums cursor-pointer ${
                          amount === preset
                            ? 'border-[#23374B] bg-[#23374B] text-white'
                            : 'border-[#DCE4EC] bg-white text-[#1A2B3C] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#53667A]">
                      $
                    </span>
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      aria-label="Custom contribution amount in dollars"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[#DCE4EC] text-sm text-[#1A2B3C] tabular-nums focus:outline-hidden focus:border-[#23374B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#53667A] mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                          paymentMethod === method.id
                            ? 'border-[#23374B] bg-[#EEF3F7] text-[#1A2B3C]'
                            : 'border-[#DCE4EC] bg-white text-[#53667A] hover:text-[#1A2B3C]'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#1A2B3C] whitespace-nowrap">
                          {method.label}
                        </div>
                        <div className="text-[11px] text-[#53667A] mt-0.5 truncate">
                          {method.subtitle}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'Card' && (
                  <div className="p-4 rounded-xl border border-[#DCE4EC] bg-[#F8FAFC] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#23374B]">
                      <CreditCard className="w-4 h-4" />
                      <span>Card Details</span>
                    </div>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card number"
                      aria-label="Card number"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#DCE4EC] bg-white text-sm font-mono text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        aria-label="Card expiration"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#DCE4EC] bg-white text-sm font-mono text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                      />
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="CVC"
                        aria-label="Card security code"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#DCE4EC] bg-white text-sm font-mono text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Apple Pay' && (
                  <div className="p-4 rounded-xl border border-[#DCE4EC] bg-[#F8FAFC] flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-[#23374B] shrink-0" />
                    <p className="text-xs text-[#425569]">
                      Express settlement enabled for Millie &amp; Edgar’s registry fund. Click Pay below to authorize your ${amount} gift.
                    </p>
                  </div>
                )}

                {paymentMethod === 'Zelle' && (
                  <div className="p-4 rounded-xl border border-[#DCE4EC] bg-[#F8FAFC] space-y-1.5">
                    <p className="text-xs font-semibold text-[#1A2B3C]">
                      Zelle Direct Recipient: @millie-edgar-2026 (millie.edgar@opalretreat.com)
                    </p>
                    <p className="text-xs text-[#425569]">
                      Zero platform fee. Submitting records your gift message and generates an instant reference code.
                    </p>
                  </div>
                )}

                {paymentMethod === 'Bank Transfer' && (
                  <div className="p-4 rounded-xl border border-[#DCE4EC] bg-[#F8FAFC] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#23374B]">
                      <Landmark className="w-4 h-4" />
                      <span>ACH Routing · Chase Trust •••• 9182</span>
                    </div>
                    <input
                      type="text"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      placeholder="Account holder name (e.g., Elena Martinez)"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#DCE4EC] bg-white text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#53667A] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={contributorName}
                      onChange={(e) => setContributorName(e.target.value)}
                      placeholder="Elena Martinez"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#DCE4EC] text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#53667A] mb-1">
                      Receipt Email
                    </label>
                    <input
                      type="email"
                      required
                      value={contributorEmail}
                      onChange={(e) => setContributorEmail(e.target.value)}
                      placeholder="elena@example.com"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#DCE4EC] text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#53667A] mb-1">
                    Personal Note for Millie &amp; Edgar (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Wishing you a lifetime of joy together..."
                    className="w-full px-3.5 py-2 rounded-lg border border-[#DCE4EC] text-sm text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-[#9B2C2C] font-medium">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-5 rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  {submitting
                    ? 'Processing Payment...'
                    : `Pay $${amount.toLocaleString()} via ${paymentMethod}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
