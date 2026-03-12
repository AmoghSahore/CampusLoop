import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Laptop, FlaskConical, Armchair, Shirt, Package } from 'lucide-react';

const categories = [
  { title:'Textbooks',     count:342, icon:BookOpen,    grad:'linear-gradient(135deg,#bfdbfe,#93c5fd)', textColor:'#1d4ed8' },
  { title:'Electronics',   count:189, icon:Laptop,      grad:'linear-gradient(135deg,#c7d2fe,#a5b4fc)', textColor:'#4338ca' },
  { title:'Lab Equipment', count:127, icon:FlaskConical, grad:'linear-gradient(135deg,#99f6e4,#5eead4)', textColor:'#0f766e' },
  { title:'Furniture',     count:95,  icon:Armchair,    grad:'linear-gradient(135deg,#fde68a,#fcd34d)', textColor:'#92400e' },
  { title:'Clothing',      count:211, icon:Shirt,       grad:'linear-gradient(135deg,#fbcfe8,#f9a8d4)', textColor:'#9d174d' },
  { title:'Others',        count:78,  icon:Package,     grad:'linear-gradient(135deg,#ddd6fe,#c4b5fd)', textColor:'#5b21b6' },
];

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selected = searchParams.get('category') || '';
  const normalize = v => { const s=(v||'').toLowerCase().trim(); return s==='others'||s==='other'?'other':s; };
  const handleClick = t => navigate(selected===t ? '/' : `/?category=${encodeURIComponent(t)}`);

  return (
    <section id="categories" className="relative section-pad bg-[var(--bg)]">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-60" aria-hidden />
      <div className="container-xl relative">
        <div className="mb-14 text-center">
          <span className="section-eyebrow">Browse by category</span>
          <h2 className="mt-4 text-3xl font-extrabold text-[var(--fg)] sm:text-4xl">Find exactly what you need</h2>
          <p className="mx-auto mt-3 max-w-xl text-[var(--fg-muted)]">
            From day-one textbooks to final-year furniture — everything stays on campus for fast handoffs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const isSelected = normalize(selected) === normalize(cat.title);
            const Icon = cat.icon;
            return (
              <button key={cat.title} onClick={() => handleClick(cat.title)}
                className={`group glass-card flex flex-col items-center gap-3 p-5 text-center transition-all duration-200 hover:-translate-y-1.5 ${
                  isSelected ? 'ring-2 ring-[var(--primary)] border-[var(--primary)] bg-[var(--primary-light)]' : 'hover:border-[var(--primary)]/60'
                }`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                  style={{ background: cat.grad }}>
                  <Icon className="h-6 w-6" style={{ color: cat.textColor }} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--fg)]'}`}>{cat.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--fg-muted)]">{cat.count} items</p>
                </div>
                {isSelected && (
                  <span className="mt-0.5 text-xs font-semibold text-[var(--primary)]">✓ Active</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
