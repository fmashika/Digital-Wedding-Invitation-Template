import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  RotateCcw,
  ScanLine,
  Upload,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import type { RsvpRecord } from '../types';
import { ScrollReveal } from './ScrollReveal';

interface CheckInSectionProps {
  rsvps: RsvpRecord[];
  prefilledCode: string;
  onCheckInUpdated: (updatedRsvps: RsvpRecord[]) => void;
}

interface ScanResult {
  status: 'checked_in' | 'already_checked_in' | 'error';
  message: string;
  guest?: RsvpRecord;
}

export function CheckInSection({
  rsvps,
  prefilledCode,
  onCheckInUpdated,
}: CheckInSectionProps) {
  const [manualCode, setManualCode] = useState(prefilledCode);
  const [scanningCamera, setScanningCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScannedRef = useRef<string>('');

  const attendingGuests = rsvps.filter((r) => r.attending);
  const checkedInCount = attendingGuests.filter(
    (r) => r.checkInStatus === 'checked_in'
  ).length;

  useEffect(() => {
    if (prefilledCode) {
      setManualCode(prefilledCode);
      void verifyPassCode(prefilledCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledCode]);

  const stopCamera = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanningCamera(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const verifyPassCode = async (rawCode: string) => {
    const clean = rawCode.trim();
    if (!clean) return;
    setVerifying(true);
    try {
      const response = await fetch('/api/checkin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });
      const data = await response.json();
      if (!response.ok) {
        setScanResult({
          status: 'error',
          message: data.error ?? 'Unable to verify guest pass.',
        });
        return;
      }

      onCheckInUpdated(data.db.rsvps);
      setScanResult({
        status: data.status,
        guest: data.guest,
        message:
          data.status === 'already_checked_in'
            ? `${data.guest.guestName} was already checked in.`
            : `Welcome to Opal Retreat, ${data.guest.guestName}. Entry approved.`,
      });
    } catch {
      setScanResult({
        status: 'error',
        message: 'Network error while verifying guest check-in pass.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera scanning is unavailable in this browser context. Upload a QR pass image or enter a pass code below.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setScanningCamera(true);

      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
          scanVideoFrame();
        }
      }, 60);
    } catch {
      setCameraError(
        'Camera access was declined or no camera is connected. You can still upload a QR pass image or scan a guest pass code.'
      );
      stopCamera();
    }
  };

  const scanVideoFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !streamRef.current) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (decoded?.data && decoded.data !== lastScannedRef.current) {
          lastScannedRef.current = decoded.data;
          setManualCode(decoded.data.replace('WEDDING-CHECKIN:', ''));
          void verifyPassCode(decoded.data);
          stopCamera();
          return;
        }
      }
    }

    rafRef.current = requestAnimationFrame(scanVideoFrame);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCameraError('');

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);
        if (decoded?.data) {
          setManualCode(decoded.data.replace('WEDDING-CHECKIN:', ''));
          void verifyPassCode(decoded.data);
        } else {
          setScanResult({
            status: 'error',
            message: 'No valid QR code found in the uploaded image.',
          });
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetPass = async (passCode: string) => {
    try {
      const response = await fetch('/api/checkin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passCode }),
      });
      const data = await response.json();
      if (response.ok) {
        onCheckInUpdated(data.db.rsvps);
        if (scanResult?.guest?.passCode === passCode) {
          setScanResult(null);
        }
      }
    } catch {
      // Ignore reset network issue
    }
  };

  return (
    <section id="checkin" className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <ScrollReveal direction="left" distance={40} blur={10}>
          <p className="text-xs font-medium text-[#53667A]">
            Opal Retreat Courtyard Entrance · Self &amp; Usher Check-In
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-[#1A2B3C] text-balance">
            Ceremony Check-In Scanner
          </h2>
          <p className="mt-2 text-[15px] text-[#425569] max-w-2xl">
            Scan your QR ceremony pass using the camera, upload your saved pass image, or enter your invitation pass code to verify seating and enter the ceremony.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.08} distance={32} blur={8} className="text-left md:text-right shrink-0">
          <p className="text-xs text-[#53667A]">Ceremony Arrivals</p>
          <p className="font-display text-2xl text-[#1A2B3C] tabular-nums">
            {checkedInCount} / {attendingGuests.length} Checked In
          </p>
        </ScrollReveal>
      </div>

      <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        <ScrollReveal direction="left" delay={0.06} distance={44} blur={10} className="lg:col-span-6 rounded-2xl border border-[#DCE4EC] bg-white p-5 sm:p-6 space-y-6">
          <div className="rounded-xl border border-[#DCE4EC] bg-[#0F1B26] overflow-hidden relative min-h-[260px] flex flex-col items-center justify-center text-white p-6">
            <canvas ref={canvasRef} className="hidden" />
            {scanningCamera ? (
              <>
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs text-white/80">
                    Point a QR Ceremony Pass at the camera...
                  </span>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    Stop Camera
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center max-w-sm">
                <ScanLine className="w-10 h-10 mx-auto text-[#A6BDD3]" strokeWidth={1.5} />
                <h3 className="mt-3 font-display text-2xl text-white">
                  Scan QR Ceremony Pass
                </h3>
                <p className="mt-1 text-xs text-white/75">
                  Activate your device camera or upload a saved QR pass PNG for instant verification.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2.5 rounded-lg bg-white text-[#1A2B3C] text-xs font-semibold hover:bg-[#EEF3F7] inline-flex items-center gap-2 whitespace-nowrap cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Start Camera Scanner
                  </button>
                  <label className="px-4 py-2.5 rounded-lg border border-white/25 bg-white/10 hover:bg-white/20 text-white text-xs font-medium inline-flex items-center gap-2 whitespace-nowrap cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload QR Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="text-xs text-[#9B2C2C] bg-[#FDF2F2] border border-[#F5D0D0] rounded-lg px-3.5 py-2.5">
              {cameraError}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verifyPassCode(manualCode);
            }}
            className="space-y-2"
          >
            <label className="block text-xs font-medium text-[#53667A]">
              Enter or Scan Pass Code Manually
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g., PASS-101 or PW-4821"
                className="flex-1 min-w-0 px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#DCE4EC] bg-[#F8FAFC] text-base sm:text-sm font-mono text-[#1A2B3C] focus:outline-hidden focus:border-[#23374B]"
              />
              <button
                type="submit"
                disabled={verifying}
                className="px-5 py-2.5 min-h-[44px] rounded-lg bg-[#23374B] text-white text-sm font-medium hover:bg-[#1A2B3C] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
              >
                {verifying ? 'Checking...' : 'Verify Entry'}
              </button>
            </div>
          </form>

          {scanResult && (
            <div
              className={`rounded-xl p-5 border ${
                scanResult.status === 'error'
                  ? 'bg-[#FDF2F2] border-[#F2CACA] text-[#7A1F1F]'
                  : 'bg-[#EEF6F2] border-[#C6DFD1] text-[#1A4731]'
              }`}
            >
              <div className="flex items-start gap-3">
                {scanResult.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold">{scanResult.message}</p>
                  {scanResult.guest && (
                    <div className="mt-3 pt-3 border-t border-black/10 grid grid-cols-2 gap-y-2 text-xs">
                      <div>
                        <span className="opacity-75">Table Assignment:</span>{' '}
                        <strong className="font-semibold">
                          {scanResult.guest.tableAssignment}
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-75">Party Size:</span>{' '}
                        <strong className="font-semibold tabular-nums">
                          {scanResult.guest.partySize}{' '}
                          {scanResult.guest.partySize === 1 ? 'Guest' : 'Guests'}
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-75">Meal:</span>{' '}
                        <strong className="font-semibold">
                          {scanResult.guest.mealChoice}
                        </strong>
                      </div>
                      <div>
                        <span className="opacity-75">Pass Code:</span>{' '}
                        <strong className="font-mono font-semibold">
                          {scanResult.guest.passCode}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.12} distance={44} blur={10} className="lg:col-span-6 rounded-2xl border border-[#DCE4EC] bg-white p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#DCE4EC]">
            <div>
              <h3 className="font-display text-2xl text-[#1A2B3C]">
                Guest Entrance Manifest
              </h3>
              <p className="text-xs text-[#53667A]">
                Tap any pass below to simulate scanning at the ceremony gate
              </p>
            </div>
            <UserCheck className="w-5 h-5 text-[#53667A]" />
          </div>

          <div className="divide-y divide-[#EDF2F7] mt-2">
            {attendingGuests.length === 0 ? (
              <p className="py-8 text-sm text-[#53667A] text-center">
                No confirmed attending guests yet.
              </p>
            ) : (
              attendingGuests.map((guest) => {
                const isCheckedIn = guest.checkInStatus === 'checked_in';
                return (
                  <div
                    key={guest.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-semibold text-[#1A2B3C]">
                          {guest.guestName}
                        </span>
                        <span className="font-mono text-xs text-[#5B7A96]">
                          · {guest.passCode}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#53667A]">
                        Party of {guest.partySize} · {guest.tableAssignment} ·{' '}
                        {isCheckedIn && guest.checkedInAt
                          ? `Checked in at ${new Date(
                              guest.checkedInAt
                            ).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}`
                          : 'Awaiting arrival'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCheckedIn ? (
                        <>
                          <span className="text-xs font-medium text-[#1A4731]">
                            Checked In
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResetPass(guest.passCode)}
                            title="Reset check-in status"
                            aria-label={`Reset check-in for ${guest.guestName}`}
                            className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-[#DCE4EC] text-[#53667A] hover:text-[#1A2B3C] hover:bg-[#F8FAFC] cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setManualCode(guest.passCode);
                            void verifyPassCode(guest.passCode);
                          }}
                          className="px-4 py-2 min-h-[40px] rounded-lg border border-[#DCE4EC] bg-[#F8FAFC] hover:bg-[#23374B] hover:text-white hover:border-[#23374B] text-xs font-medium text-[#1A2B3C] transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Scan Pass
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
