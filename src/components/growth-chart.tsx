import { useId, useMemo, useRef, useState } from 'react';

/**
 * Lightweight SVG line/area chart. Replaces recharts (≈ 400 kB of the old
 * bundle) for the handful of yearly series the calculators draw.
 */

export interface ChartSeries {
  key: string;
  name: string;
  color: string;
  /** Draw as a dashed line without fill. */
  dashed?: boolean;
}

interface GrowthChartProps {
  title: string;
  subtitle?: string;
  data: Record<string, number>[];
  /** Key in each row holding the x value (a year number). */
  xKey: string;
  series: ChartSeries[];
  formatValue: (n: number) => string;
  formatAxis: (n: number) => string;
  xLabel?: (n: number) => string;
}

const W = 640;
const H = 260;
const PAD = { top: 8, right: 12, bottom: 26, left: 58 };

function niceMax(v: number) {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

export function GrowthChart({
  title,
  subtitle,
  data,
  xKey,
  series,
  formatValue,
  formatAxis,
  xLabel = (n) => `Year ${n}`,
}: GrowthChartProps) {
  const gradId = useId().replace(/:/g, '');
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { xs, paths, ticks } = useMemo(() => {
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const rawMax = Math.max(1, ...data.flatMap((row) => series.map((s) => row[s.key] ?? 0)));
    const maxY = niceMax(rawMax);
    const n = data.length;
    const xs = data.map((_, i) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW));
    const y = (v: number) => PAD.top + innerH - (Math.max(0, v) / maxY) * innerH;
    const paths = series.map((s) => {
      const pts = data.map((row, i) => `${xs[i].toFixed(1)},${y(row[s.key] ?? 0).toFixed(1)}`);
      const line = `M${pts.join('L')}`;
      const area = `${line}L${xs[n - 1]?.toFixed(1)},${(PAD.top + innerH).toFixed(1)}L${xs[0]?.toFixed(1)},${(PAD.top + innerH).toFixed(1)}Z`;
      return { ...s, line, area, y };
    });
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ v: maxY * f, y: y(maxY * f) }));
    return { xs, paths, ticks };
  }, [data, series]);

  const onMove = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || data.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    xs.forEach((px, i) => {
      if (Math.abs(px - x) < Math.abs(xs[best] - x)) best = i;
    });
    setHover(best);
  };

  const step = Math.max(1, Math.ceil(data.length / 8));
  const hoverRow = hover != null ? data[hover] : null;

  return (
    <div className="rounded-lg border border-line bg-surface p-6 sm:p-7">
      <h4 className="t-h3 text-ink">{title}</h4>
      {subtitle && <p className="mt-1 text-[0.8125rem] text-ink-3">{subtitle}</p>}

      <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-[0.8125rem] text-ink-2">
            <span
              aria-hidden="true"
              className="inline-block h-0 w-4 border-t-2"
              style={{ borderColor: s.color, borderStyle: s.dashed ? 'dashed' : 'solid' }}
            />
            {s.name}
          </li>
        ))}
      </ul>

      <div className="relative mt-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full touch-pan-y select-none"
          role="img"
          aria-label={`${title}. ${series.map((s) => `${s.name} reaches ${formatValue(data[data.length - 1]?.[s.key] ?? 0)}`).join('; ')}.`}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseLeave={() => setHover(null)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={() => setHover(null)}
        >
          <defs>
            {paths.map((p) => (
              <linearGradient key={p.key} id={`${gradId}-${p.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={p.color} stopOpacity={0.16} />
                <stop offset="100%" stopColor={p.color} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>

          {ticks.map((t) => (
            <g key={t.v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="var(--grid)" strokeWidth={1} />
              <text x={PAD.left - 8} y={t.y + 4} textAnchor="end" fontSize={11} fill="var(--ink-3)">
                {formatAxis(t.v)}
              </text>
            </g>
          ))}

          {data.map((row, i) =>
            i % step === 0 || i === data.length - 1 ? (
              <text key={i} x={xs[i]} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--ink-3)">
                {row[xKey]}
              </text>
            ) : null
          )}

          {paths.map((p) =>
            p.dashed ? null : <path key={`a-${p.key}`} d={p.area} fill={`url(#${gradId}-${p.key})`} />
          )}
          {paths.map((p) => (
            <path
              key={`l-${p.key}`}
              d={p.line}
              fill="none"
              stroke={p.color}
              strokeWidth={2}
              strokeDasharray={p.dashed ? '5 4' : undefined}
              strokeLinejoin="round"
            />
          ))}

          {hover != null && (
            <g>
              <line x1={xs[hover]} x2={xs[hover]} y1={PAD.top} y2={H - PAD.bottom} stroke="var(--line-2)" />
              {paths.map((p) => (
                <circle
                  key={p.key}
                  cx={xs[hover]}
                  cy={p.y(data[hover][p.key] ?? 0)}
                  r={4}
                  fill={p.color}
                  stroke="var(--surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
        </svg>

        {hoverRow && hover != null && (
          <div
            className="pointer-events-none absolute top-1 rounded-md border border-line bg-surface px-3 py-2 text-[0.8125rem] shadow-[0_4px_16px_rgba(20,23,26,0.07)]"
            style={{
              left: `${(xs[hover] / W) * 100}%`,
              transform: xs[hover] > W * 0.6 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)',
            }}
          >
            <p className="mb-1 text-ink-3">{xLabel(hoverRow[xKey])}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center justify-between gap-4 text-ink">
                <span className="text-ink-2">{s.name}</span>
                <span className="tabular font-medium">{formatValue(hoverRow[s.key] ?? 0)}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
