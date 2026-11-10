import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Camera, CameraOff, Flashlight } from "lucide-react";

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

type Controls = {
  stop: () => void | Promise<void>;
  switchTorch?: (on: boolean) => Promise<void>;
};

type BarcodeCameraProps = {
  onDetected: (code: string) => void;
};

const frontLabel = /front|user|face|facetime/i;
const backLabel = /back|rear|environment|world/i;

export default function BarcodeCamera({ onDetected }: BarcodeCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<Controls | null>(null);
  const onDetectedRef = useRef(onDetected);
  const lastCodeRef = useRef("");
  const requestRef = useRef(0);
  const facingRef = useRef<Facing>("environment");
  const [live, setLive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facing, setFacing] = useState<Facing>("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  onDetectedRef.current = onDetected;

  async function releaseCamera() {
    const controls = controlsRef.current;
    controlsRef.current = null;
    const stop = controls?.stop();
    if (stop instanceof Promise) {
      try {
        await stop;
      } catch {
        // The next getUserMedia still needs the tracks stopped.
      }
    }

    const video = videoRef.current;
    const stream = video?.srcObject instanceof MediaStream ? video.srcObject : null;
    const tracks = stream?.getTracks() ?? [];
    tracks.forEach((track) => track.stop());
    if (video) {
      video.pause();
      video.srcObject = null;
    }
    if (tracks.length > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, 200));
    }
  }

  async function openFacingStream(nextFacing: Facing) {
    const attempts: MediaTrackConstraints[] = [
      { facingMode: { exact: nextFacing } },
      { facingMode: nextFacing },
    ];

    let lastError: unknown;
    for (const video of attempts) {
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: false, video });
      } catch (error) {
        lastError = error;
      }
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const labeled = cameras.find((device) =>
      nextFacing === "user" ? frontLabel.test(device.label) : backLabel.test(device.label),
    );
    const fallback = labeled ?? (nextFacing === "user" ? cameras.at(-1) : cameras[0]);
    if (!fallback?.deviceId) {
      throw lastError instanceof Error ? lastError : new Error("No camera");
    }

    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { deviceId: { exact: fallback.deviceId } },
    });
  }

  async function startCamera(nextFacing: Facing) {
    const video = videoRef.current;
    if (!video) return;
    if (nextFacing === facingRef.current && controlsRef.current) return;

    const requestId = ++requestRef.current;
    setCameraError("");
    await releaseCamera();
    if (requestRef.current !== requestId) return;

    try {
      const stream = await openFacingStream(nextFacing);
      if (requestRef.current !== requestId) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 250,
        delayBetweenScanSuccess: 800,
      });
      const controls = await reader.decodeFromStream(stream, video, (result) => {
        const value = result?.getText()?.trim() ?? "";
        if (!value || value === lastCodeRef.current) return;
        lastCodeRef.current = value;
        onDetectedRef.current(value);
      });

      if (requestRef.current !== requestId) {
        const stop = controls.stop();
        if (stop instanceof Promise) await stop;
        return;
      }

      const track = stream.getVideoTracks()[0];
      const reported = track?.getSettings().facingMode;
      const actual: Facing =
        reported === "user" || reported === "environment" ? reported : nextFacing;

      controlsRef.current = controls;
      facingRef.current = actual;
      setFacing(actual);
      setTorchSupported(
        Boolean(controls.switchTorch) &&
          BrowserMultiFormatReader.mediaStreamIsTorchCompatible(stream),
      );
      setTorchOn(false);
      setLive(true);
    } catch {
      if (requestRef.current !== requestId) return;
      setLive(false);
      setTorchSupported(false);
      setCameraError(
        nextFacing === "user"
          ? "Front camera isn't available."
          : "Back camera isn't available. You can still type the code.",
      );
    }
  }

  function stopCamera() {
    requestRef.current += 1;
    void releaseCamera();
    setLive(false);
    setTorchOn(false);
    setTorchSupported(false);
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

  useEffect(() => {
    void startCamera("environment");
    return () => {
      requestRef.current += 1;
      void releaseCamera();
    };
    // Open the back camera when this panel mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-3 rounded-2xl bg-canvas p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Camera size={16} />
          Camera Preview
        </p>
        <span className="inline-flex items-center gap-2 text-xs text-slate-500">
          <span
            className={`h-2 w-2 rounded-full ${live ? "bg-primary" : "bg-slate-300"}`}
          />
          {live ? "Camera on" : "Camera off"}
        </span>
      </div>

      <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${live ? "opacity-100" : "opacity-0"} ${
            facing === "user" ? "-scale-x-100" : ""
          }`}
        />

        <ViewfinderCorners />

        {live ? (
          <span className="animate-scan-line pointer-events-none absolute right-16 left-16 h-px bg-primary shadow-[0_0_12px_rgba(4,120,87,0.45)]" />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <Camera size={64} strokeWidth={1.25} className="text-slate-300" />
            <p className="absolute inset-x-6 bottom-6 text-center text-sm text-slate-400">
              {cameraError || "Camera preview will appear here"}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => (live ? stopCamera() : void startCamera(facingRef.current))}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        {live ? <CameraOff size={16} /> : <Camera size={16} />}
        {live ? "Stop Camera" : "Start Camera"}
      </button>

      {live ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-pressed={facing === "environment"}
              onClick={() => void startCamera("environment")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                facing === "environment"
                  ? "bg-primary text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              Back
            </button>
            <button
              type="button"
              aria-pressed={facing === "user"}
              onClick={() => void startCamera("user")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                facing === "user"
                  ? "bg-primary text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              Front
            </button>
          </div>
          <button
            type="button"
            aria-label={torchOn ? "Turn flashlight off" : "Turn flashlight on"}
            aria-pressed={torchOn}
            disabled={!torchSupported}
            onClick={() => void toggleTorch()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 disabled:opacity-40"
          >
            <Flashlight size={14} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function ViewfinderCorners() {
  const arm = "pointer-events-none absolute h-14 w-14 border-primary";
  return (
    <>
      <span className={`${arm} top-7 left-8 rounded-tl-2xl border-t-[5px] border-l-[5px]`} />
      <span className={`${arm} top-7 right-8 rounded-tr-2xl border-t-[5px] border-r-[5px]`} />
      <span className={`${arm} bottom-7 left-8 rounded-bl-2xl border-b-[5px] border-l-[5px]`} />
      <span className={`${arm} right-8 bottom-7 rounded-br-2xl border-r-[5px] border-b-[5px]`} />
    </>
  );
}
