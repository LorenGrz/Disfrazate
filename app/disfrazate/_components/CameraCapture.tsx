"use client";

import { useCallback, useRef, useState } from "react";
import { drawToJpegB64 } from "@/lib/image";

type CameraStatus = "idle" | "starting" | "live" | "unavailable";

type CameraCaptureProps = {
  onCapture: (jpegB64: string) => void;
  onError: (message: string) => void;
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function CameraCapture({ onCapture, onError }: CameraCaptureProps) {
  const [status, setStatus] = useState<CameraStatus>("idle");
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Cada pedido de cámara lleva un número; cancelar lo invalida.
  const requestRef = useRef(0);

  // Ref callback: conecta el stream al <video> cuando aparece, y apaga la
  // cámara si el componente se desmonta con la cámara prendida.
  // Estable (useCallback): si cambiara en cada render, React lo desengancharía
  // y apagaría la cámara.
  const attachVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      void node.play().catch(() => undefined);
    }
    return () => {
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
        video: { facingMode: "user" },
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

  function cancel() {
    requestRef.current += 1;
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
      requestRef.current += 1;
      stopStream(streamRef.current);
      streamRef.current = null;
      setStatus("idle");
      onCapture(jpeg);
    } catch {
      onError("No pudimos sacar la foto. Probá de nuevo");
    }
  }

  if (status === "live") {
    return (
      <div className="flex flex-col gap-4">
        <video
          ref={attachVideo}
          muted
          playsInline
          aria-label="Vista previa de tu cámara"
          className="aspect-[4/5] w-full max-w-md well object-cover"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void snap()}
            className="btn btn-accent press"
          >
            Sacar foto
          </button>
          <button type="button" onClick={cancel} className="btn press">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {status === "unavailable" ? null : (
        <button
          type="button"
          onClick={() => void start()}
          disabled={status === "starting"}
          className="btn press self-start"
        >
          {status === "starting"
            ? "Prendiendo la cámara..."
            : "Usar la cámara de la compu"}
        </button>
      )}
      {status === "unavailable" ? (
        <p role="status">
          No pudimos abrir la cámara. Hace falta dar permiso y entrar por https
          (o localhost). Subí una foto con el botón de arriba.
        </p>
      ) : null}
    </div>
  );
}
