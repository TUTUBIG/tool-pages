"use client";

import { Clipboard, Palette } from "lucide-react";
import { useCallback, useRef, useState } from "react";

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function ColorPickerTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [hex, setHex] = useState("");
  const [rgb, setRgb] = useState("");
  const [pickedRgb, setPickedRgb] = useState<{ r: number; g: number; b: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState(false);
  const [copyDone, setCopyDone] = useState<"hex" | "rgb" | null>(null);

  const loadFile = useCallback((file: File) => {
    setError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = 900;
      const maxH = 600;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      const scale = Math.min(1, maxW / w, maxH / h);
      w = Math.floor(w * scale);
      h = Math.floor(h * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("Could not read canvas context.");
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      setHasImage(true);
      setHex("");
      setRgb("");
      setPickedRgb(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Could not load image.");
    };
    img.src = url;
  }, []);

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) void loadFile(f);
    },
    [loadFile],
  );

  const sampleAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !hasImage) return;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const x = Math.floor((clientX - rect.left) * sx);
    const y = Math.floor((clientY - rect.top) * sy);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const d = ctx.getImageData(x, y, 1, 1).data;
    const r = d[0]!;
    const g = d[1]!;
    const b = d[2]!;
    setHex(rgbToHex(r, g, b));
    setRgb(`rgb(${r}, ${g}, ${b})`);
    setPickedRgb({ r, g, b });
  }, [hasImage]);

  const copy = useCallback(async (kind: "hex" | "rgb") => {
    const text = kind === "hex" ? hex : rgb;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyDone(kind);
      window.setTimeout(() => setCopyDone(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, [hex, rgb]);

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Choose an image, then click or drag on the preview to sample a pixel.
      </p>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            Choose image
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="max-h-[60vh] w-full cursor-crosshair rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-900"
          onMouseDown={(e) => sampleAt(e.clientX, e.clientY)}
          onMouseMove={(e) => {
            if (e.buttons === 1) sampleAt(e.clientX, e.clientY);
          }}
        />
        {error ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex shrink-0 flex-col gap-2 sm:self-stretch sm:justify-center">
            <span className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              Picked color
            </span>
            <div
              className={`size-28 shrink-0 rounded-lg border-2 border-neutral-300 shadow-inner dark:border-neutral-600 ${
                !pickedRgb ? "bg-neutral-100 dark:bg-neutral-800" : ""
              }`}
              style={
                pickedRgb
                  ? { backgroundColor: `rgb(${pickedRgb.r}, ${pickedRgb.g}, ${pickedRgb.b})` }
                  : undefined
              }
              aria-hidden
            />
            {!pickedRgb ? (
              <p className="max-w-[8rem] text-xs text-neutral-500 dark:text-neutral-400">
                Sample a pixel on the image.
              </p>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 divide-y divide-neutral-200 dark:divide-neutral-700 sm:flex sm:divide-x sm:divide-y-0">
            <div className="pb-4 sm:shrink-0 sm:pb-0 sm:pr-8">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">Hex</span>
                <button
                  type="button"
                  disabled={!hex}
                  onClick={() => void copy("hex")}
                  className="flex items-center gap-1 text-sm text-indigo-600 disabled:opacity-40 dark:text-indigo-400"
                >
                  <Clipboard className="h-4 w-4" />
                  {copyDone === "hex" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="font-mono text-lg text-neutral-900 dark:text-neutral-100">{hex || "—"}</p>
            </div>
            <div className="pt-4 sm:flex-1 sm:pt-0 sm:pl-8">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">RGB</span>
                <button
                  type="button"
                  disabled={!rgb}
                  onClick={() => void copy("rgb")}
                  className="flex items-center gap-1 text-sm text-indigo-600 disabled:opacity-40 dark:text-indigo-400"
                >
                  <Clipboard className="h-4 w-4" />
                  {copyDone === "rgb" ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="break-all font-mono text-lg text-neutral-900 dark:text-neutral-100">{rgb || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <Palette className="h-5 w-5" aria-hidden />
          <span>Tip: drag while holding the mouse button to sweep across tones.</span>
        </div>
      </div>
    </div>
  );
}
