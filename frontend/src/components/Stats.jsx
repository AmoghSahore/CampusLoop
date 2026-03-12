import { useEffect, useRef, useState } from 'react';
import { Home, Scale, Clock, Users } from 'lucide-react';

const statsData = [
  { icon: Home,  target: 12300, format: v => (v/1000).toFixed(1)+'k', label: 'Items rehomed',   iconBg: 'linear-gradient(135deg,#4ade80,#22c55e)', iconColor: '#fff' },
  { icon: Scale, target: 68,    format: v => v+' tons',               label: 'Waste diverted',  iconBg: 'linear-gradient(135deg,#34d399,#059669)', iconColor: '#fff' },
  { icon: Clock, target: 8,     format: v => v+' min',                label: 'Avg. reply time', iconBg: 'linear-gradient(135deg,#60a5fa,#3b82f6)', iconColor: '#fff' },
  { icon: Users, target: 4200,  format: v => (v/1000).toFixed(1)+'k', label: 'Active students', iconBg: 'linear-gradient(135deg,#f59e0b,#d97706)', iconColor: '#fff' },
];

function StatItem({ icon: Icon, target, format, label, iconBg, iconColor, active }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1600, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(e * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target]);

  return (
    <div className="group flex flex-col items-center gap-3 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
        style={{ background: iconBg }}>
        <Icon className="h-6 w-6" style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold tabular-nums text-[var(--fg)]">{format(count)}</p>
        <p className="mt-0.5 text-sm text-[var(--fg-muted)]">{label}</p>
      </div>
    </div>
  );
}

const Stats = () => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white py-12 border-b border-[var(--border)]">
      <div className="container-xl">
        {/* Subtle gradient divider at top */}
        <div className="mb-10 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, var(--primary), transparent)' }} />
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {statsData.map((s) => <StatItem key={s.label} {...s} active={active} />)}
        </div>
      </div>
    </section>
  );
};

export default Stats;
