"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { decodeIcoPngLayers, readPngDimensions, type IcoPngLayer } from "@/lib/decode-ico";
import { encodeIcoFromPngs } from "@/lib/encode-ico";

const DEFAULT_SIZES = [16, 32, 48, 64, 128, 256] as const;

type Mode = "svg-ico" | "ico-svg";

function rasterizeSvgToPng(svgBlob: Blob, maxSide: number): Promise<{ width: number; height: number; data: Uint8Array }> {
  const url = URL.createObjectURL(svgBlob);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not decode SVG."));
    img.src = url;
  })
    .then((img) => {
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w <= 0 || h <= 0) {
        w = maxSide;
        h = maxSide;
      }
      const scale = Math.min(maxSide / w, maxSide / h);
      const cw = Math.max(1, Math.round(w * scale));
      const ch = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available.");
      ctx.drawImage(img, 0, 0, cw, ch);
      return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png")).then((blob) => {
        if (!blob) throw new Error("PNG encoding failed.");
        return blob.arrayBuffer().then((buf) => ({
          width: cw,
          height: ch,
          data: new Uint8Array(buf),
        }));
      });
    })
    .finally(() => {
      URL.revokeObjectURL(url);
    });
}

function parseCustomSizes(text: string): number[] {
  return text
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 512);
}

function parseDimInput(s: string): number | undefined {
  const t = s.trim();
  if (t === "") return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 1 || n > 4096) return undefined;
  return Math.round(n);
}

function computeSvgOutputSize(
  iw: number,
  ih: number,
  widthStr: string,
  heightStr: string,
): { outW: number; outH: number } {
  const wIn = parseDimInput(widthStr);
  const hIn = parseDimInput(heightStr);
  if (wIn !== undefined && hIn !== undefined) return { outW: wIn, outH: hIn };
  if (wIn !== undefined) return { outW: wIn, outH: Math.max(1, Math.round((ih / iw) * wIn)) };
  if (hIn !== undefined) return { outW: Math.max(1, Math.round((iw / ih) * hIn)), outH: hIn };
  return { outW: iw, outH: ih };
}

async function uint8ToBase64DataUrlPayload(png: Uint8Array): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Failed to read PNG data."));
    fr.readAsDataURL(new Blob([png.slice()], { type: "image/png" }));
  });
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

async function buildSvgWithEmbeddedPng(
  png: Uint8Array,
  intrinsicW: number,
  intrinsicH: number,
  outW: number,
  outH: number,
): Promise<string> {
  const b64 = await uint8ToBase64DataUrlPayload(png);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${outW}" height="${outH}" viewBox="0 0 ${intrinsicW} ${intrinsicH}">
  <image width="${intrinsicW}" height="${intrinsicH}" href="data:image/png;base64,${b64}" preserveAspectRatio="none"/>
</svg>`;
}

export function SvgToIcoTool() {
  const svgInputRef = useRef<HTMLInputElement>(null);
  const icoInputRef = useRef<HTMLInputElement>(null);
  const lastSvgBlobRef = useRef<Blob | null>(null);
  const lastFileNameRef = useRef("icon.svg");
  const runGenRef = useRef(0);
  const icoRunGenRef = useRef(0);
  const lastIcoLayersRef = useRef<IcoPngLayer[] | null>(null);

  const [mode, setMode] = useState<Mode>("svg-ico");
  const [sizes, setSizes] = useState<number[]>(() => [...DEFAULT_SIZES]);
  const [customSizesInput, setCustomSizesInput] = useState("");

  const [icoSelectedIndex, setIcoSelectedIndex] = useState(0);
  const [icoLoadKey, setIcoLoadKey] = useState(0);
  const [icoOutWidth, setIcoOutWidth] = useState("");
  const [icoOutHeight, setIcoOutHeight] = useState("");
  const [icoFileName, setIcoFileName] = useState("icon.ico");

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("icon.ico");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<string | null>(null);

  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [layerPreviews, setLayerPreviews] = useState<{ url: string; label: string }[]>([]);
  const layerPreviewsRef = useRef(layerPreviews);
  layerPreviewsRef.current = layerPreviews;

  const [icoLayerPickerUrls, setIcoLayerPickerUrls] = useState<{ url: string; label: string }[]>([]);
  const icoPickerRef = useRef(icoLayerPickerUrls);
  icoPickerRef.current = icoLayerPickerUrls;

  const revokeDownload = useCallback(() => {
    setDownloadUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  useEffect(() => () => revokeDownload(), [revokeDownload]);

  useEffect(() => {
    return () => {
      if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
    };
  }, [sourcePreviewUrl]);

  useEffect(() => {
    return () => {
      for (const p of layerPreviewsRef.current) URL.revokeObjectURL(p.url);
    };
  }, []);

  useEffect(() => {
    return () => {
      for (const p of icoPickerRef.current) URL.revokeObjectURL(p.url);
    };
  }, []);

  const clearIcoPickerUrls = useCallback(() => {
    setIcoLayerPickerUrls((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.url);
      return [];
    });
  }, []);

  const buildIco = useCallback(
    async (svgBlob: Blob, baseName: string) => {
      lastSvgBlobRef.current = svgBlob;
      const gen = ++runGenRef.current;
      setError(null);
      setBusy(true);
      revokeDownload();
      setMeta(null);

      const custom = parseCustomSizes(customSizesInput);
      const ordered = [...new Set([...sizes, ...custom])]
        .filter((n) => n >= 1 && n <= 512)
        .sort((a, b) => a - b);
      if (ordered.length === 0) {
        setLayerPreviews((prev) => {
          for (const p of prev) URL.revokeObjectURL(p.url);
          return [];
        });
        setBusy(false);
        setError("Select at least one output size, or add custom sizes (1–512 px).");
        return;
      }

      try {
        const pngs = await Promise.all(ordered.map((s) => rasterizeSvgToPng(svgBlob, s)));
        if (gen !== runGenRef.current) return;
        const icoBytes = encodeIcoFromPngs(pngs);
        const icoBlob = new Blob([icoBytes.slice()], { type: "image/x-icon" });
        const outUrl = URL.createObjectURL(icoBlob);
        setDownloadUrl(outUrl);
        setDownloadName(`${baseName.replace(/\.[^.]+$/, "") || "icon"}.ico`);
        setMeta(
          `${ordered.join(", ")} px — ${pngs.length} PNG layer${pngs.length === 1 ? "" : "s"}, ${(icoBytes.length / 1024).toFixed(1)} KB`,
        );
        const nextLayers = pngs.map((p) => ({
          url: URL.createObjectURL(new Blob([p.data.slice()], { type: "image/png" })),
          label: `${p.width}×${p.height}`,
        }));
        setLayerPreviews((prev) => {
          for (const x of prev) URL.revokeObjectURL(x.url);
          return nextLayers;
        });
      } catch (e) {
        if (gen !== runGenRef.current) return;
        setError(e instanceof Error ? e.message : "Conversion failed.");
        setLayerPreviews((prev) => {
          for (const p of prev) URL.revokeObjectURL(p.url);
          return [];
        });
      } finally {
        if (gen === runGenRef.current) setBusy(false);
      }
    },
    [customSizesInput, revokeDownload, sizes],
  );

  const buildIcoToSvg = useCallback(async () => {
    const layers = lastIcoLayersRef.current;
    if (!layers?.length) return;
    const gen = ++icoRunGenRef.current;
    setError(null);
    setBusy(true);
    revokeDownload();
    setMeta(null);

    const idx = Math.min(Math.max(0, icoSelectedIndex), layers.length - 1);
    const layer = layers[idx]!;
    let iw = layer.pngWidth;
    let ih = layer.pngHeight;
    try {
      const d = readPngDimensions(layer.data);
      iw = d.width;
      ih = d.height;
    } catch {
      /* use layer fields */
    }

    const { outW, outH } = computeSvgOutputSize(iw, ih, icoOutWidth, icoOutHeight);

    try {
      const svgText = await buildSvgWithEmbeddedPng(layer.data, iw, ih, outW, outH);
      if (gen !== icoRunGenRef.current) return;
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const outUrl = URL.createObjectURL(blob);
      setDownloadUrl(outUrl);
      const stem = icoFileName.replace(/\.[^.]+$/, "") || "icon";
      setDownloadName(`${stem}.svg`);
      setMeta(`Layer ${idx + 1} — intrinsic ${iw}×${ih}, SVG display ${outW}×${outH} px`);
    } catch (e) {
      if (gen !== icoRunGenRef.current) return;
      setError(e instanceof Error ? e.message : "SVG build failed.");
    } finally {
      if (gen === icoRunGenRef.current) setBusy(false);
    }
  }, [icoFileName, icoOutHeight, icoOutWidth, icoSelectedIndex, revokeDownload]);

  const onSvgFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (!f) return;
      if (!f.name.toLowerCase().endsWith(".svg") && f.type !== "image/svg+xml") {
        setError("Please choose an SVG file.");
        return;
      }
      lastFileNameRef.current = f.name;
      setSourcePreviewUrl(URL.createObjectURL(f));
      void buildIco(f, f.name);
    },
    [buildIco],
  );

  const onIcoFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      if (!f) return;
      const ok =
        f.name.toLowerCase().endsWith(".ico") ||
        f.type === "image/x-icon" ||
        f.type === "image/vnd.microsoft.icon";
      if (!ok) {
        setError("Please choose an ICO file.");
        return;
      }
      setIcoFileName(f.name);
      setError(null);
      revokeDownload();
      setMeta(null);
      setDownloadUrl(null);

      f.arrayBuffer()
        .then((buf) => {
          const bytes = new Uint8Array(buf);
          const layers = decodeIcoPngLayers(bytes);
          lastIcoLayersRef.current = layers;
          clearIcoPickerUrls();
          const thumbs = layers.map((L) => ({
            url: URL.createObjectURL(new Blob([L.data.slice()], { type: "image/png" })),
            label: `${L.pngWidth}×${L.pngHeight}`,
          }));
          setIcoLayerPickerUrls(thumbs);
          const largest = layers.reduce((best, cur, i) => {
            const a = cur.pngWidth * cur.pngHeight;
            const ba = layers[best]!.pngWidth * layers[best]!.pngHeight;
            return a > ba ? i : best;
          }, 0);
          setIcoSelectedIndex(largest);
          setIcoLoadKey((k) => k + 1);
          setMeta(`${layers.length} PNG layer${layers.length === 1 ? "" : "s"} — pick one and set output size, then download SVG.`);
        })
        .catch((err) => {
          lastIcoLayersRef.current = null;
          clearIcoPickerUrls();
          setError(err instanceof Error ? err.message : "Could not read ICO.");
        });
    },
    [clearIcoPickerUrls, revokeDownload],
  );

  useEffect(() => {
    const b = lastSvgBlobRef.current;
    if (!b || mode !== "svg-ico") return;
    void buildIco(b, lastFileNameRef.current);
  }, [buildIco, mode, sizes, customSizesInput]);

  useEffect(() => {
    if (mode !== "ico-svg" || !lastIcoLayersRef.current?.length) return;
    void buildIcoToSvg();
  }, [buildIcoToSvg, icoLoadKey, icoOutHeight, icoOutWidth, icoSelectedIndex, mode]);

  const toggleSize = (n: number) => {
    setSizes((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setMeta(null);
    setBusy(false);
    revokeDownload();
    if (m === "svg-ico") {
      clearIcoPickerUrls();
      lastIcoLayersRef.current = null;
    } else {
      setLayerPreviews((prev) => {
        for (const p of prev) URL.revokeObjectURL(p.url);
        return [];
      });
      setSourcePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      lastSvgBlobRef.current = null;
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Convert in your browser: <strong className="font-medium text-neutral-800 dark:text-neutral-200">SVG → ICO</strong>{" "}
        (multi-size favicon) or <strong className="font-medium text-neutral-800 dark:text-neutral-200">ICO → SVG</strong>{" "}
        (wraps a PNG layer in an SVG; true vectorization is not performed). PNG-in-ICO only; BMP-only icons are not
        supported. External SVG assets may not render if blocked.
      </p>

      <div className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-600 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => switchMode("svg-ico")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "svg-ico"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          SVG → ICO
        </button>
        <button
          type="button"
          onClick={() => switchMode("ico-svg")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "ico-svg"
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
              : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          }`}
        >
          ICO → SVG
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        {mode === "svg-ico" ? (
          <>
            <input
              ref={svgInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              className="hidden"
              onChange={onSvgFile}
            />
            <div className="mb-4 flex flex-wrap items-end gap-4">
              <button
                type="button"
                onClick={() => svgInputRef.current?.click()}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                Choose SVG
              </button>
              <label className="flex min-w-[10rem] flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                <span>Custom sizes (px), space or comma</span>
                <input
                  type="text"
                  value={customSizesInput}
                  onChange={(e) => setCustomSizesInput(e.target.value)}
                  placeholder="e.g. 20 72 96"
                  className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </label>
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Preset sizes (px)</span>
              {DEFAULT_SIZES.map((n) => (
                <label
                  key={n}
                  className="flex cursor-pointer items-center gap-1.5 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <input
                    type="checkbox"
                    checked={sizes.includes(n)}
                    onChange={() => toggleSize(n)}
                    className="rounded border-neutral-300 dark:border-neutral-600"
                  />
                  {n}
                </label>
              ))}
            </div>
          </>
        ) : (
          <>
            <input ref={icoInputRef} type="file" accept=".ico,image/x-icon,image/vnd.microsoft.icon" className="hidden" onChange={onIcoFile} />
            <div className="mb-4 flex flex-wrap items-end gap-6">
              <button
                type="button"
                onClick={() => icoInputRef.current?.click()}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
              >
                Choose ICO
              </button>
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <span>Output width (px)</span>
                  <input
                    type="number"
                    min={1}
                    max={4096}
                    value={icoOutWidth}
                    onChange={(e) => setIcoOutWidth(e.target.value)}
                    placeholder="intrinsic"
                    className="w-28 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <span>Output height (px)</span>
                  <input
                    type="number"
                    min={1}
                    max={4096}
                    value={icoOutHeight}
                    onChange={(e) => setIcoOutHeight(e.target.value)}
                    placeholder="intrinsic"
                    className="w-28 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </label>
              </div>
              <p className="max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
                Leave both empty to use the PNG’s pixel size. Set one side to scale proportionally; set both to stretch
                the raster inside the SVG.
              </p>
            </div>
            {icoLayerPickerUrls.length > 0 ? (
              <div className="mb-4">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Layer</span>
                <ul className="mt-2 flex flex-wrap gap-3">
                  {icoLayerPickerUrls.map((p, i) => (
                    <li key={p.url}>
                      <label
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border bg-neutral-100 p-2 dark:border-neutral-600 dark:bg-neutral-950 ${
                          icoSelectedIndex === i
                            ? "border-indigo-500 ring-2 ring-indigo-500"
                            : "border-neutral-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="ico-layer"
                          checked={icoSelectedIndex === i}
                          onChange={() => setIcoSelectedIndex(i)}
                          className="sr-only"
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="size-16 object-contain [image-rendering:pixelated]" />
                        <span className="text-[10px] font-medium tabular-nums text-neutral-600 dark:text-neutral-300">
                          {p.label}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        )}

        {busy ? <p className="text-sm text-neutral-500">Working…</p> : null}
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        {meta ? <p className="text-sm text-neutral-600 dark:text-neutral-400">{meta}</p> : null}
        {downloadUrl ? (
          <a
            href={downloadUrl}
            download={downloadName}
            className="mt-4 inline-flex rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-md"
          >
            Download {mode === "svg-ico" ? "ICO" : "SVG"}
          </a>
        ) : null}

        {mode === "svg-ico" && (sourcePreviewUrl || layerPreviews.length > 0) ? (
          <div className="mt-8 space-y-8 border-t border-neutral-200 pt-8 dark:border-neutral-700">
            {sourcePreviewUrl ? (
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                  Source SVG
                </h3>
                <div className="mt-2 inline-block max-w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-600 dark:bg-neutral-950">
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL from user file */}
                  <img
                    src={sourcePreviewUrl}
                    alt="Uploaded SVG preview"
                    className="max-h-[min(50vh,360px)] w-auto max-w-full object-contain"
                  />
                </div>
              </div>
            ) : null}
            {layerPreviews.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                  ICO layers (PNG)
                </h3>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Thumbnails are scaled up with crisp pixels so small sizes are easy to check.
                </p>
                <ul className="mt-3 flex flex-wrap gap-4">
                  {layerPreviews.map((p) => (
                    <li
                      key={p.url}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-200 bg-neutral-100 p-3 dark:border-neutral-600 dark:bg-neutral-950"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL from canvas PNG */}
                      <img
                        src={p.url}
                        alt={`Raster layer ${p.label}`}
                        className="size-20 object-contain [image-rendering:pixelated]"
                      />
                      <span className="text-[11px] font-medium text-neutral-600 tabular-nums dark:text-neutral-300">
                        {p.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {mode === "ico-svg" && downloadUrl && lastIcoLayersRef.current?.[icoSelectedIndex] ? (
          <div className="mt-8 space-y-4 border-t border-neutral-200 pt-8 dark:border-neutral-700">
            <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              SVG preview
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Raster embedded in SVG — scaling uses your output width/height.
            </p>
            <div className="inline-block max-w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-600 dark:bg-neutral-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={downloadUrl} alt="Exported SVG preview" className="max-h-[min(50vh,360px)] w-auto max-w-full object-contain" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
