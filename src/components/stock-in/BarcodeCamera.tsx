import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.QR_CODE,
]);

type Facing = "environment" | "user";

type BarcodeCameraProps = {
  onDetected: (code: string) => void;
};

export default function BarcodeCamera({ onDetected }: BarcodeCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectedRef = useRef(onDetected);
  const [facing, setFacing] = useState<Facing>("environment");
  const [error, setError] = useState("");

  onDetectedRef.current = onDetected;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let stopped = false;
    let controls: { stop: () => void } | null = null;
    let reported = false;
    setError("");

    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 250,
      delayBetweenScanSuccess: 800,
    });

    reader
      .decodeFromConstraints(
        {
          audio: false,
          video: { facingMode: { ideal: facing } },
        },
        video,
        (result) => {
          const value = result?.getText()?.trim() ?? "";
          if (!value || reported || stopped) return;
          reported = true;
          onDetectedRef.current(value);
        },
      )
      .then((next) => {
        controls = next;
        if (stopped) next.stop();
      })
      .catch(() => {
        if (!stopped) {
          setError("Camera access was blocked. You can still type the code.");
        }
      });

    return () => {
      stopped = true;
      controls?.stop();
      const stream = video.srcObject;
      if (stream instanceof MediaStream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      video.srcObject = null;
    };
  }, [facing]);

  return (
    <div className="mt-3 overflow-hidden rounded-xl bg-slate-950">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${
            facing === "user" ? "-scale-x-100" : ""
          }`}
        />
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={() => setFacing("environment")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              facing === "environment"
                ? "bg-primary text-white"
                : "bg-black/70 text-white"
            }`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setFacing("user")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              facing === "user" ? "bg-primary text-white" : "bg-black/70 text-white"
            }`}
          >
            Front
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-8 inset-y-8 rounded-lg border-2 border-dashed border-emerald-400/90">
          <span className="animate-scan-line absolute right-3 left-3 h-px bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
        </div>
        {error ? (
          <p className="absolute inset-x-6 bottom-4 text-center text-sm text-white/85">
            {error}
          </p>
        ) : (
          <p className="absolute inset-x-6 bottom-4 text-center text-xs text-white/70">
            Point the camera at a barcode
          </p>
        )}
      </div>
    </div>
  );
}
