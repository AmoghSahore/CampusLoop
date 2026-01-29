import { useNavigate, useSearchParams } from 'react-router-dom';

const categories = [
  { title: "Textbooks", count: "342 items", icon: "📘", color: "bg-sky-50 text-sky-700 ring-sky-200" },
  { title: "Electronics", count: "189 items", icon: "💻", color: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
  { title: "Lab Equipment", count: "127 items", icon: "🧪", color: "bg-teal-50 text-teal-700 ring-teal-200" },
  { title: "Furniture", count: "95 items", icon: "🛋️", color: "bg-amber-50 text-amber-700 ring-amber-200" },
  { title: "Clothing", count: "211 items", icon: "👟", color: "bg-pink-50 text-pink-700 ring-pink-200" },
  { title: "Other", count: "78 items", icon: "🛠️", color: "bg-lime-50 text-lime-700 ring-lime-200" },
];

const Categories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';

  const handleCategoryClick = (categoryTitle) => {
    if (selectedCategory === categoryTitle) {
      // If already selected, clear the filter
      navigate('/');
    } else {
      // Navigate with category parameter
      navigate(`/?category=${encodeURIComponent(categoryTitle)}`);
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-100">
            Categories
          </span>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Browse by need</h2>
          <p className="max-w-2xl text-lg text-slate-600">
            Find what you need or list what you do not. Everything stays on campus for fast handoffs.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.title;
            return (
              <button
                key={category.title}
                onClick={() => handleCategoryClick(category.title)}
                className={`group rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg text-left w-full ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-50/60 ring-2 ring-emerald-400'
                    : 'border-slate-100 bg-slate-50/60'
                }`}
              >
                <div className={`mb-4 inline-flex rounded-2xl px-4 py-3 text-2xl ring-1 ${category.color}`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{category.title}</h3>
                <p className="text-sm text-slate-500">{category.count}</p>
                <div className={`mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700 transition ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {isSelected ? '✓ Selected' : 'Explore items'} <span aria-hidden>{isSelected ? '' : '→'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;

