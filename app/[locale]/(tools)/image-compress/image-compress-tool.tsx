"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const MAX_DIM = 4096;

type OutputImageMime = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

function canvasSupportsMime(mime: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const d = c.toDataURL(mime);
    return d.startsWith(`data:${mime}`);
  } catch {
    return false;
  }
}

function fileExtForMime(mime: OutputImageMime): string {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

function formatLabelForMime(mime: OutputImageMime): string {
  switch (mime) {
    case "image/png":
      return "PNG";
    case "image/jpeg":
      return "JPEG";
    case "image/webp":
      return "WebP";
    case "image/avif":
      return "AVIF";
    default:
      return mime;
  }
}

export function ImageCompressTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const compressRef = useRef<(file: File) => void>(() => {});
  const encodeGenRef = useRef(0);

  const [quality, setQuality] = useState(0.82);
  const [mime, setMime] = useState<OutputImageMime>("image/jpeg");
  const avifSupported = useSyncExternalStore(
    () => () => {},
    () => canvasSupportsMime("image/avif"),
    () => false,
  );
  const effectiveMime: OutputImageMime =
    mime === "image/avif" && !avifSupported ? "image/webp" : mime;

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokePreviewUrl();
  }, [revokePreviewUrl]);

  const compress = useCallback(
    (file: File) => {
      lastFileRef.current = file;
      const gen = ++encodeGenRef.current;
      setError(null);
      setBusy(true);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (gen !== encodeGenRef.current) return;
        URL.revokeObjectURL(url);
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w <= 0 || h <= 0) {
          w = MAX_DIM;
          h = MAX_DIM;
        }
        const scale = Math.min(1, MAX_DIM / w, MAX_DIM / h);
        w = Math.floor(w * scale);
        h = Math.floor(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setBusy(false);
          setError("Canvas is not available.");
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (gen !== encodeGenRef.current) return;
            setBusy(false);
            if (!blob) {
              setError("Encoding failed.");
              return;
            }
            revokePreviewUrl();
            const out = URL.createObjectURL(blob);
            previewUrlRef.current = out;
            setDownloadUrl(out);
            const base = file.name.replace(/\.[^.]+$/, "") || "image";
            setDownloadName(`${base}-compressed.${fileExtForMime(effectiveMime)}`);
            setMeta(
              `${file.name} → ${(blob.size / 1024).toFixed(1)} KB (${w}×${h}, ${formatLabelForMime(effectiveMime)})`,
            );
          },
          effectiveMime,
          quality,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        if (gen !== encodeGenRef.current) return;
        setBusy(false);
        setError("Could not decode image.");
      };
      img.src = url;
    },
    [effectiveMime, quality, revokePreviewUrl],
  );

  useEffect(() => {
    compressRef.current = compress;
  }, [compress]);

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) compress(f);
    },
    [compress],
  );

  useEffect(() => {
    const f = lastFileRef.current;
    if (!f) return;
    compressRef.current(f);
  }, [effectiveMime, quality]);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Raster images and <strong className="font-medium text-neutral-800 dark:text-neutral-200">SVG</strong> (drawn to
        a bitmap first) are resized if wider or taller than {MAX_DIM}px, then exported as{" "}
        <strong className="font-medium text-neutral-800 dark:text-neutral-200">PNG, JPEG, WebP</strong>
        {avifSupported ? (
          <>
            , or <strong className="font-medium text-neutral-800 dark:text-neutral-200">AVIF</strong>
          </>
        ) : null}
        . JPEG is lossy and drops transparency; PNG is lossless; WebP and AVIF can be lossy or lossless depending on the
        browser. External fonts or images in SVG may not render if the browser blocks them. Adjust format and quality to
        refresh the preview.
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.svg,image/svg+xml"
          className="hidden"
          onChange={onFile}
        />
        <div className="mb-4 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Choose image
          </button>
          <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
            Format
            <select
              suppressHydrationWarning
              value={effectiveMime}
              onChange={(e) => setMime(e.target.value as OutputImageMime)}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
              {avifSupported ? <option value="image/avif">AVIF</option> : null}
            </select>
          </label>
          <label
            className={`flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300 ${
              effectiveMime === "image/png" ? "cursor-not-allowed opacity-50" : ""
            }`}
            title={
              effectiveMime === "image/png"
                ? "PNG is lossless; this browser may ignore quality for PNG."
                : undefined
            }
          >
            Quality {(quality * 100).toFixed(0)}%
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.02}
              value={quality}
              disabled={effectiveMime === "image/png"}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-32 disabled:cursor-not-allowed"
            />
          </label>
        </div>
        {busy ? <p className="text-sm text-neutral-500">Compressing…</p> : null}
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        {meta ? <p className="text-sm text-neutral-600 dark:text-neutral-400">{meta}</p> : null}
        {downloadUrl ? (
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                Compressed preview
              </h3>
              <div className="mt-2 inline-block max-w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL from canvas.toBlob */}
                <img
                  src={downloadUrl}
                  alt="Compressed image preview"
                  className="max-h-[min(60vh,520px)] w-auto max-w-full object-contain"
                />
              </div>
            </div>
            <a
              href={downloadUrl}
              download={downloadName}
              className="inline-flex rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-md"
            >
              Download
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
