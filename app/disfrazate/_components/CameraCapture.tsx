"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { drawToJpegB64, fileToJpegB64 } from "@/lib/image";

type CameraStatus = "idle" | "starting" | "live" | "unavailable";

type PhotoStageProps = {
  /** Foto ya tomada (JPEG base64 sin prefijo) o null. */
  photo: string | null;
  onPhoto: (jpegB64: string) => void;
  onClear: () => void;
  onError: (message: string) => void;
};

const COUNTDOWN_FROM = 3;

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

/** Silueta de cuerpo entero: guía para que la persona entre completa en el cuadro. */
function Silhouette() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 220"
      className="pointer-events-none absolute inset-y-[6%] left-1/2 h-[88%] -translate-x-1/2 fill-current text-[var(--ink)] opacity-[0.13]"
    >
      <circle cx="50" cy="22" r="16" />
      <path d="M30 44h40c8 0 13 6 14 13l6 58c1 6-7 8-9 2l-7-44v147c0 7-11 7-12 0l-6-84h-12l-6 84c-1 7-12 7-12 0V73l-7 44c-2 6-10 4-9-2l6-58c1-7 6-13 14-13z" />
    </svg>
  );
}

/**
 * El "estudio": cámara en vivo (espejada, con silueta y cuenta regresiva),
 * subida de archivo y vista previa sin recortar. Todo pasa en handlers y en
 * un ref callback, sin useEffect.
 */
export function PhotoStage({
  photo,
  onPhoto,
  onClear,
  onError,
}: PhotoStageProps) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [count, setCount] = useState<number | null>(null);
  const [flash, setFlash] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timersRef = useRef<number[]>([]);
  // Cada pedido de cámara lleva un número; cancelar lo invalida.
  const requestRef = useRef(0);

  function clearTimers() {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }

  // Ref callback estable: conecta el stream al <video> cuando aparece y apaga
  // cámara y timers si el video se desmonta con la cámara prendida.
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      void node.play().catch(() => undefined);
    }
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
      stopStream(streamRef.current);
      streamRef.current = null;
      videoRef.current = null;
    };
  }, []);

  async function start() {
    const devices = (navigator as { mediaDevices?: MediaDevices }).mediaDevices;
    if (typeof devices?.getUserMedia !== "function") {
      setStatus("unavailable");
      return;
    }
    const request = ++requestRef.current;
    setStatus("starting");
    try {
      const stream = await devices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (request !== requestRef.current) {
        stopStream(stream);
        return;
      }
      streamRef.current = stream;
      setStatus("live");
    } catch {
      if (request === requestRef.current) setStatus("unavailable");
    }
  }

  function stopCamera() {
    requestRef.current += 1;
    clearTimers();
    setCount(null);
    stopStream(streamRef.current);
    streamRef.current = null;
    setStatus("idle");
  }

  async function snap() {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    try {
      const jpeg = await drawToJpegB64(
        video,
        video.videoWidth,
        video.videoHeight,
      );
      setFlash((value) => value + 1);
      stopCamera();
      onPhoto(jpeg);
    } catch {
      onError("No pudimos sacar la foto. Probá de nuevo");
    }
  }

  function startCountdown() {
    clearTimers();
    setCount(COUNTDOWN_FROM);
    for (let step = 1; step <= COUNTDOWN_FROM; step += 1) {
      const id = window.setTimeout(() => {
        const left = COUNTDOWN_FROM - step;
        if (left > 0) {
          setCount(left);
        } else {
          setCount(null);
          void snap();
        }
      }, step * 1000);
      timersRef.current.push(id);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      stopCamera();
      onPhoto(await fileToJpegB64(file));
    } catch {
      onError("No pudimos leer esa foto. Probá con otra");
    } finally {
      input.value = "";
    }
  }

  const uploadButton = (
    <label className="btn press cursor-pointer">
      {photo === null ? "Subir una foto" : "Subir otra"}
      <input
        type="file"
        accept="image/*"
        capture="user"
        onChange={(event) => void handleFile(event)}
        className="sr-only"
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="well relative h-[min(56svh,600px)] w-full overflow-hidden">
        {photo !== null ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL local, no pasa por el optimizador
          <img
            src={`data:image/jpeg;base64,${photo}`}
            alt="Tu foto, lista para disfrazar"
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : status === "live" ? (
          <>
            <video
              ref={attachVideo}
              muted
              playsInline
              aria-label="Vista previa de tu cámara"
              className="absolute inset-0 h-full w-full -scale-x-100 object-contain"
            />
            <Silhouette />
            {count !== null ? (
              <p
                key={count}
                aria-live="assertive"
                className="display countdown absolute inset-0 flex items-center justify-center text-[clamp(6rem,22vw,16rem)]"
              >
                {count}
              </p>
            ) : null}
          </>
        ) : (
          <>
            <Silhouette />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
              <p className="display text-h3">Entrá entero en el cuadro</p>
              <p className="max-w-sm">
                De frente, con buena luz y un poco lejos de la cámara.
              </p>
              {status === "unavailable" ? (
                <p role="status" className="max-w-sm">
                  No pudimos abrir la cámara (hace falta dar permiso y entrar
                  por https). Subí una foto.
                </p>
              ) : null}
            </div>
          </>
        )}
        {flash > 0 ? (
          <div
            key={flash}
            aria-hidden="true"
            className="camera-flash pointer-events-none absolute inset-0 bg-white opacity-0"
          />
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {photo !== null ? (
          <>
            <button type="button" onClick={onClear} className="btn press">
              Sacar otra
            </button>
            {uploadButton}
          </>
        ) : status === "live" ? (
          <>
            <button
              type="button"
              onClick={startCountdown}
              disabled={count !== null}
              className="btn btn-accent press disabled:opacity-40"
            >
              {count !== null ? "Quieto..." : "Sacar foto en 3 segundos"}
            </button>
            <button
              type="button"
              onClick={() => void snap()}
              disabled={count !== null}
              className="btn press disabled:opacity-40"
            >
              Ya
            </button>
            <button type="button" onClick={stopCamera} className="btn press">
              Cancelar
            </button>
          </>
        ) : (
          <>
            {status === "unavailable" ? null : (
              <button
                type="button"
                onClick={() => void start()}
                disabled={status === "starting"}
                className="btn btn-accent press disabled:opacity-40"
              >
                {status === "starting"
                  ? "Prendiendo la cámara..."
                  : "Prender la cámara"}
              </button>
            )}
            {uploadButton}
          </>
        )}
      </div>
    </div>
  );
}
