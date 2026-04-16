"use client";

import { Clipboard, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

export function GradientTool() {
  const [c1, setC1] = useState("#6366f1");
  const [c2, setC2] = useState("#9333ea");
  const [c3, setC3] = useState("#ec4899");
  const [useThird, setUseThird] = useState(false);
  const [angle, setAngle] = useState(120);
  /** Second color stop (%) for two-color gradient. */
  const [divider2, setDivider2] = useState(50);
  /** Second color stop (%) when three colors — must be ≤ divider3. */
  const [divider12, setDivider12] = useState(33);
  /** Third color stop (%) when three colors — must be ≥ divider12. */
  const [divider23, setDivider23] = useState(66);
  const [copyDone, setCopyDone] = useState(false);

  const css = useMemo(() => {
    if (useThird) {
      return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${divider12}%, ${c3} ${divider23}%)`;
    }
    return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} ${divider2}%)`;
  }, [c1, c2, c3, useThird, angle, divider2, divider12, divider23]);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      /* ignore */
    }
  }, [css]);

  const onDivider12 = useCallback((v: number) => {
    setDivider12(v);
    setDivider23((d) => Math.max(d, v));
  }, []);

  const onDivider23 = useCallback((v: number) => {
    setDivider23(v);
    setDivider12((d) => Math.min(d, v));
  }, []);

  return (
    <div className="max-w-6xl space-y-6">
      <div
        className="h-40 w-full rounded-2xl border border-neutral-200 shadow-inner dark:border-neutral-600"
        style={{ background: css }}
      />
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900/80">
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Color 1
            <input
              type="color"
              value={c1}
              onChange={(e) => setC1(e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-neutral-200 dark:border-neutral-600"
            />
          </label>
          <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Color 2
            <input
              type="color"
              value={c2}
              onChange={(e) => setC2(e.target.value)}
              className="mt-1 h-10 w-full cursor-pointer rounded border border-neutral-200 dark:border-neutral-600"
            />
          </label>
          {useThird ? (
            <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              Color 3
              <input
                type="color"
                value={c3}
                onChange={(e) => setC3(e.target.value)}
                className="mt-1 h-10 w-full cursor-pointer rounded border border-neutral-200 dark:border-neutral-600"
              />
            </label>
          ) : (
            <div />
          )}
          <label className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
            Angle {angle}°
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="mt-2 w-full"
            />
          </label>
        </div>

        {useThird ? (
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              <span className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                Color 2 stop
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={divider12}
                  onChange={(e) => onDivider12(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-10 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  {divider12}%
                </span>
              </div>
            </label>
            <label className="text-sm text-neutral-700 dark:text-neutral-300">
              <span className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
                Color 3 stop
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={divider23}
                  onChange={(e) => onDivider23(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-10 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                  {divider23}%
                </span>
              </div>
            </label>
          </div>
        ) : (
          <label className="mb-4 block text-sm text-neutral-700 dark:text-neutral-300">
            <span className="text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400">
              Color 2 stop (divider)
            </span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={divider2}
                onChange={(e) => setDivider2(Number(e.target.value))}
                className="max-w-md flex-1"
              />
              <span className="w-10 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                {divider2}%
              </span>
            </div>
          </label>
        )}

        <label className="mb-4 flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input type="checkbox" checked={useThird} onChange={(e) => setUseThird(e.target.checked)} />
          Three color stops
        </label>

        <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
          Stop positions are percentages along the gradient line (0% at the start, 100% at the end).
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <code className="flex-1 break-all rounded-lg bg-neutral-100 px-3 py-2 font-mono text-sm dark:bg-neutral-950 dark:text-neutral-200">
            {css}
          </code>
          <button
            type="button"
            onClick={() => void copy()}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Clipboard className="h-4 w-4" />
            {copyDone ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Sparkles className="h-4 w-4 shrink-0" />
        Use as{" "}
        <code className="rounded bg-neutral-100 px-1 text-xs dark:bg-neutral-800">background: {css};</code>
      </p>
    </div>
  );
}
