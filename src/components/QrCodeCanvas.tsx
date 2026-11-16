import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';

interface QrCodeCanvasProps {
  passCode: string;
  guestName: string;
  size?: number;
}

export function QrCodeCanvas({ passCode, guestName, size = 188 }: QrCodeCanvasProps) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    const payload = `WEDDING-CHECKIN:${passCode}`;
    QRCode.toDataURL(payload, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#1A2B3C',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [passCode, size]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `ceremony-pass-${passCode.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-xl border border-[#DCE4EC] shadow-xs">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR entry pass for ${guestName} (${passCode})`}
            width={size}
            height={size}
            className="block rounded-md"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-[#F4F7FA] text-xs text-[#53667A] rounded-md"
          >
            Generating pass...
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={!dataUrl}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#23374B] hover:text-[#1A2B3C] underline underline-offset-4 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        Save QR Pass PNG
      </button>
    </div>
  );
}
