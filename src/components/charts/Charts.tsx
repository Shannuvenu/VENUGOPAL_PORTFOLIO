"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

/** Measures a container's width so SVG charts redraw crisply on resize. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(el);
    setW(Math.floor(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * p;
}

/** Round axis: nice step for ~`count` intervals, top = smallest multiple of step ≥ max. */
function niceTicks(maxValue: number, count: number) {
  const step = niceMax(Math.max(maxValue, 1e-9) / count);
  const top = Math.max(step, Math.ceil(maxValue / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return { top, ticks };
}

const AXIS = "#8b98ad";
const GRID = "rgb(148 163 184 / 0.10)";

function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = Math.min(Math.max(x, 70), Math.max(width - 70, 70));
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line-strong bg-ink-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
      style={{ left, top: y - 10 }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────────── Line chart ───────────────────────────── */

export function LineChart({
  data,
  format,
  xFormat,
  color = "#2dd4bf",
  height = 240,
  label,
}: {
  data: { x: string; y: number }[];
  format: (v: number) => string;
  xFormat: (x: string) => string;
  color?: string;
  height?: number;
  label: string;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { t: 12, r: 12, b: 28, l: 56 };
  const iw = Math.max(width - m.l - m.r, 10);
  const ih = height - m.t - m.b;
  const { top: max, ticks } = niceTicks(Math.max(...data.map((d) => d.y), 0), 4);
  const n = data.length;
  const x = (i: number) => m.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => m.t + ih - (v / max) * ih;
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.y)}`).join(" ");
  const area = n ? `${path} L${x(n - 1)},${m.t + ih} L${x(0)},${m.t + ih} Z` : "";
  const xEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(iw / 70))));

  function onMove(e: PointerEvent<SVGRectElement>) {
    const box = (e.currentTarget as SVGRectElement).getBoundingClientRect();
    const px = e.clientX - box.left;
    const i = n <= 1 ? 0 : Math.round((px / iw) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i)));
  }

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 && n > 0 ? (
        <svg width={width} height={height} role="img" aria-label={label}>
          <defs>
            <linearGradient id={`fill-${label.replace(/\W/g, "")}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.22" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={m.l + iw} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={m.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={AXIS} fontFamily="var(--font-mono)">
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            i % xEvery === 0 ? (
              <text key={d.x} x={x(i)} y={height - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontSize="11" fill={AXIS} fontFamily="var(--font-mono)">
                {xFormat(d.x)}
              </text>
            ) : null,
          )}
          <path d={area} fill={`url(#fill-${label.replace(/\W/g, "")})`} />
          <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {hover !== null ? (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} stroke="rgb(231 235 243 / 0.35)" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(data[hover].y)} r={5} fill="#080b12" stroke={color} strokeWidth={2} />
            </g>
          ) : null}
          <rect
            x={m.l}
            y={m.t}
            width={iw}
            height={ih}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      ) : (
        <div style={{ height }} />
      )}
      {hover !== null && data[hover] ? (
        <Tooltip x={x(hover)} y={y(data[hover].y)} width={width}>
          <div className="text-muted">{xFormat(data[hover].x)}</div>
          <div className="font-mono text-sm text-fg">{format(data[hover].y)}</div>
        </Tooltip>
      ) : null}
    </div>
  );
}

/* ───────────────────────────── Column chart ───────────────────────────── */

export function ColumnChart({
  data,
  format,
  height = 240,
  label,
  color = "#3987e5",
  highlightColor = "#d95926",
  tooltip,
  showValues = false,
}: {
  /** `display` overrides the value label (e.g. "n/a" when there is no data). */
  data: { label: string; value: number; highlight?: boolean; display?: string }[];
  format: (v: number) => string;
  height?: number;
  label: string;
  color?: string;
  highlightColor?: string;
  tooltip?: (i: number) => ReactNode;
  showValues?: boolean;
}) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { t: 18, r: 8, b: 28, l: 48 };
  const iw = Math.max(width - m.l - m.r, 10);
  const ih = height - m.t - m.b;
  const { top: max, ticks } = niceTicks(Math.max(...data.map((d) => d.value), 0) * 1.08, 2);
  const n = data.length;
  const slot = iw / Math.max(n, 1);
  const bw = Math.max(4, Math.min(48, slot - 2 - slot * 0.25));
  const y = (v: number) => m.t + ih - (v / max) * ih;
  const r = Math.min(4, bw / 2);

  return (
    <div ref={ref} className="relative w-full">
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={label} onPointerLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={m.l + iw} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={m.l - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={AXIS} fontFamily="var(--font-mono)">
                {format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = m.l + slot * i + slot / 2;
            const top = y(d.value);
            const h = m.t + ih - top;
            const x0 = cx - bw / 2;
            const fill = d.highlight ? highlightColor : color;
            const p =
              h > r
                ? `M${x0},${m.t + ih} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + bw - r} Q${x0 + bw},${top} ${x0 + bw},${top + r} V${m.t + ih} Z`
                : `M${x0},${m.t + ih} V${top} H${x0 + bw} V${m.t + ih} Z`;
            return (
              <g key={d.label}>
                <path d={p} fill={fill} opacity={hover === null || hover === i ? 1 : 0.55} />
                {(showValues || d.highlight || d.display) && (
                  <text x={cx} y={top - 6} textAnchor="middle" fontSize="11" fill={d.display ? AXIS : "#e7ebf3"} fontFamily="var(--font-mono)">
                    {d.display ?? format(d.value)}
                  </text>
                )}
                <text x={cx} y={height - 8} textAnchor="middle" fontSize="11" fill={AXIS} fontFamily="var(--font-mono)">
                  {d.label}
                </text>
                <rect
                  x={cx - slot / 2}
                  y={m.t}
                  width={slot}
                  height={ih + 20}
                  fill="transparent"
                  onPointerEnter={() => setHover(i)}
                  onPointerDown={() => setHover(i)}
                />
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
      {hover !== null && data[hover] ? (
        <Tooltip x={m.l + slot * hover + slot / 2} y={y(data[hover].value)} width={width}>
          {tooltip ? (
            tooltip(hover)
          ) : (
            <>
              <div className="text-muted">{data[hover].label}</div>
              <div className="font-mono text-sm text-fg">{format(data[hover].value)}</div>
            </>
          )}
        </Tooltip>
      ) : null}
    </div>
  );
}

/* ───────────────────────────── Horizontal bars (HTML) ───────────────────────────── */

export function BarList({
  data,
  format,
  color = "#3987e5",
  label,
}: {
  data: { label: string; value: number; note?: string; highlight?: boolean }[];
  format: (v: number) => string;
  color?: string;
  label: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3" aria-label={label}>
      {data.map((d) => (
        <li key={d.label} className="group" title={`${d.label}: ${format(d.value)}${d.note ? ` · ${d.note}` : ""}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className={d.highlight ? "font-medium text-fg" : "text-fg-2"}>{d.label}</span>
            <span className="font-mono text-fg">
              {format(d.value)}
              {d.note ? <span className="ml-2 text-xs text-muted">{d.note}</span> : null}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-ink-700/70">
            <div
              className="h-2 rounded-full transition-[width] duration-500 group-hover:brightness-125"
              style={{ width: `${(d.value / max) * 100}%`, background: color, opacity: d.highlight === false ? 0.45 : 1 }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
