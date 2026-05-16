import type { ReactNode } from "react";

/* ---------- Mini chart primitives (svg, hand-crafted, no libs) ---------- */

export function Sparkline({ data, color = "#4FD1C5", height = 36, width = 120, fill = true }: { data: number[]; color?: string; height?: number; width?: number; fill?: boolean }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const dFill = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      {fill && <path d={dFill} fill={color} fillOpacity={0.08} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LineChart({ series, height = 200 }: { series: { name: string; color: string; data: number[] }[]; height?: number }) {
  const width = 720;
  const padX = 28, padY = 18;
  const all = series.flatMap(s => s.data);
  const max = Math.max(...all), min = Math.min(...all);
  const range = max - min || 1;
  const n = series[0].data.length;
  const step = (width - padX * 2) / (n - 1);
  const yScale = (v: number) => height - padY - ((v - min) / range) * (height - padY * 2);

  const gridY = 4;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      {Array.from({ length: gridY + 1 }).map((_, i) => {
        const y = padY + (i * (height - padY * 2)) / gridY;
        return <line key={i} x1={padX} x2={width - padX} y1={y} y2={y} stroke="#2A3038" strokeDasharray="2 4" />;
      })}
      {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"].slice(0, n).map((m, i) => (
        <text key={i} x={padX + i * step} y={height - 2} fill="#7E827D" fontSize="9" textAnchor="middle">{m}</text>
      ))}
      {series.map((s, si) => {
        const pts = s.data.map((v, i) => [padX + i * step, yScale(v)]);
        const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
        return (
          <g key={si}>
            <path d={d} fill="none" stroke={s.color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="#0D0F12" stroke={s.color} strokeWidth="1.2" />)}
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segments, size = 120, label, sub }: { segments: { value: number; color: string }[]; size?: number; label: string; sub?: string }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#20252D" strokeWidth="10" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color} strokeWidth="10"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} transform={`rotate(-90 ${size/2} ${size/2})`} strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[22px] font-semibold text-pri tabular-nums leading-none">{label}</div>
          {sub && <div className="text-[10.5px] text-mut mt-1">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

export function BarRows({ rows }: { rows: { label: string; value: number; color?: string; max?: number }[] }) {
  const max = Math.max(...rows.map(r => r.max ?? r.value));
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-[12px] mb-1">
            <span className="text-sec">{r.label}</span>
            <span className="text-pri tabular-nums">{r.value}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[#20252D] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: r.color ?? "#4FD1C5" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Heatmap({ rows = 7, cols = 16 }: { rows?: number; cols?: number }) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = Math.random();
      const a = v < 0.25 ? 0.08 : v < 0.5 ? 0.18 : v < 0.75 ? 0.4 : 0.7;
      cells.push(<div key={`${r}-${c}`} className="h-3.5 rounded-[3px]" style={{ background: `rgba(79,209,197,${a})` }} />);
    }
  }
  return <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>{cells}</div>;
}

export function Stat({ label, value, tone = "text-pri" }: { label: string; value: ReactNode; tone?: string }) {
  return (
    <div>
      <div className="label-eyebrow">{label}</div>
      <div className={`mt-1 text-[15px] font-medium tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}
