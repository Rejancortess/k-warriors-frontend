import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Camera, Check, Flashlight, ScanBarcode, X } from "lucide-react";

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

type CameraScannerProps = {
  barcode: string;
  onBarcodeChange: (value: string) => void;
  onLookup: (value: string) => void;
};

const CameraScanner = ({
  barcode,
  onBarcodeChange,
  onLookup,
}: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void; switchTorch?: (on: boolean) => Promise<void> } | null>(null);
  const onLookupRef = useRef(onLookup);
  const autoFillRef = useRef(true);
  const barcodeRef = useRef(barcode);
  const lastCodeRef = useRef("");
  const startingRef = useRef(false);
  const [live, setLive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [cameraLabel, setCameraLabel] = useState("Webcam");
  const [autoFill, setAutoFill] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  onLookupRef.current = onLookup;
  autoFillRef.current = autoFill;
  barcodeRef.current = barcode;

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, []);

  async function startCamera(nextDeviceId?: string) {
    const video = videoRef.current;
    if (!video || startingRef.current) return;

    startingRef.current = true;
    setCameraError("");
    controlsRef.current?.stop();
    controlsRef.current = null;

    try {
      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 250,
        delayBetweenScanSuccess: 800,
      });
      const controls = await reader.decodeFromVideoDevice(
        nextDeviceId,
        video,
        (result) => {
          const value = result?.getText()?.trim() ?? "";
          if (!value || !autoFillRef.current) return;
          if (!barcodeRef.current) lastCodeRef.current = "";
          if (value === lastCodeRef.current) return;
          lastCodeRef.current = value;
          onLookupRef.current(value);
        },
      );

      controlsRef.current = controls;
      const track = (video.srcObject as MediaStream | null)?.getVideoTracks()[0];
      const stream = video.srcObject instanceof MediaStream ? video.srcObject : null;
      setCameraLabel(track?.label || "Webcam");
      setDeviceId(track?.getSettings().deviceId || nextDeviceId || "");
      setTorchSupported(
        Boolean(controls.switchTorch) &&
          Boolean(stream && BrowserMultiFormatReader.mediaStreamIsTorchCompatible(stream)),
      );
      setTorchOn(false);
      setLive(true);

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      setCameras(devices);
    } catch {
      setLive(false);
      setCameraError("Camera access was blocked. You can still type the barcode.");
    } finally {
      startingRef.current = false;
    }
  }

  function stopCamera() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const video = videoRef.current;
    const stream = video?.srcObject;
    if (stream instanceof MediaStream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    if (video) video.srcObject = null;
    setLive(false);
    setTorchOn(false);
    setTorchSupported(false);
  }

  function switchCamera() {
    if (cameras.length < 2) return;
    const current = cameras.findIndex((camera) => camera.deviceId === deviceId);
    const next = cameras[(Math.max(current, 0) + 1) % cameras.length];
    if (next) void startCamera(next.deviceId);
  }

  async function toggleTorch() {
    const controls = controlsRef.current;
    if (!controls?.switchTorch) return;

    const next = !torchOn;
    try {
      await controls.switchTorch(next);
      setTorchOn(next);
    } catch {
      setTorchSupported(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="rounded-2xl bg-gradient-to-b from-emerald-50 to-white px-2 pt-4 pb-3">
        <div className="flex items-center justify-between gap-3 px-2">
          <p className="text-xs font-medium tracking-[0.16em] text-slate-400">
            CAMERA SCANNER
          </p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                live ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            {live ? "Live Feed" : "Camera off"}
          </span>
        </div>

        <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950">
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-slate-950/20" />

          <div className="pointer-events-none absolute top-3 right-3 left-3 flex items-start justify-between gap-2">
            <span className="inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
              <Camera size={13} />
              <span className="truncate">{cameraLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white">
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400" : "bg-slate-400"}`} />
              {live ? "AUTO-DETECT" : "READY"}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-10 inset-y-14 rounded-lg border-2 border-dashed border-emerald-400/90">
            {live ? (
              <span className="animate-scan-line absolute right-3 left-3 h-px bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            ) : null}
          </div>

          {live ? null : (
            <button
              type="button"
              onClick={() => void startCamera()}
              className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 text-white"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                <Camera size={22} />
              </span>
              <span className="text-sm font-semibold">Scan barcode</span>
            </button>
          )}

          {cameraError ? (
            <p className="absolute inset-x-8 bottom-4 z-10 text-center text-sm text-white/80">
              {cameraError}
            </p>
          ) : null}

          {live ? (
            <div className="absolute right-3 bottom-3 left-3 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white"
                >
                  Stop camera
                </button>
                <button
                  type="button"
                  onClick={switchCamera}
                  disabled={cameras.length < 2}
                  className="inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  <Camera size={13} />
                  Switch Camera
                </button>
              </div>
              <button
                type="button"
                aria-label={torchOn ? "Turn flashlight off" : "Turn flashlight on"}
                aria-pressed={torchOn}
                disabled={!torchSupported}
                onClick={() => void toggleTorch()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white disabled:opacity-40"
              >
                <Flashlight size={14} />
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-3 px-2 text-center text-xs text-slate-400">
          {live
            ? "Point the camera at a barcode. A match fills the buffer automatically."
            : "Start the camera when you want to scan a barcode."}
        </p>
      </div>

      <div className="px-2 pt-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-800">
            Detected Barcode Buffer
          </p>
          <p className="text-xs text-slate-400">Press [Enter] if manual</p>
        </div>

        <div className="mt-2 flex items-center gap-2 rounded-xl border-2 border-primary bg-white px-3 py-2.5">
          <ScanBarcode size={16} className="shrink-0 text-slate-400" />
          <input
            value={barcode}
            onChange={(event) => onBarcodeChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onLookup(barcode);
              }
            }}
            placeholder="Scan or type a barcode"
            aria-label="Detected barcode"
            className="w-full bg-transparent text-sm font-medium tracking-wide text-slate-800 outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400"
          />
          {barcode ? (
            <button
              type="button"
              aria-label="Clear barcode"
              onClick={() => onLookup("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        <button
          type="button"
          role="checkbox"
          aria-checked={autoFill}
          onClick={() => setAutoFill((checked) => !checked)}
          className="mt-3 flex items-start gap-2 text-left text-xs text-slate-500"
        >
          <span
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
              autoFill
                ? "border-primary bg-primary text-white"
                : "border-slate-300 bg-white"
            }`}
          >
            {autoFill ? <Check size={12} /> : null}
          </span>
          Camera viewfinder automatically populates barcode buffer on focus.
        </button>
      </div>
    </section>
  );
};

export default CameraScanner;
