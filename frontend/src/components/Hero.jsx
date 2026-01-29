import { Link } from "react-router-dom";

const stats = [
  { label: "Items rehomed", value: "12.3k" },
  { label: "Waste diverted", value: "68 tons" },
  { label: "Avg. reply", value: "8 min" },
];

const featuredListings = [
  {
    tag: "Buy",
    tagColor: "bg-amber-100 text-amber-800",
    title: "Operating Systems Concepts",
    price: "₹450",
    meta: "Book · CSE",
    user: "Arjun K.",
    time: "2d ago",
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80",
  },
  {
    tag: "Free",
    tagColor: "bg-emerald-100 text-emerald-700",
    title: "Lab coat, size M",
    price: "Free",
    meta: "Lab gear · Biology",
    user: "Priya S.",
    time: "5h ago",
    image:
      "https://images.unsplash.com/photo-1580281657527-47f249e8f2f9?auto=format&fit=crop&w=1000&q=80",
  },
];

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-500 text-white">
      <div className="pointer-events-none absolute inset-0 bg-hero-grid bg-[size:24px_24px] opacity-20" aria-hidden />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/30">
            ♻ Sustainable campus marketplace
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Give campus gear a second life.
            <span className="block text-emerald-50">Save money, reduce waste.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-emerald-50/90">
            Buy, rent, or donate textbooks, electronics, furniture, and lab equipment within your campus community. Trusted listings, fast replies, zero hassle.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/80">
              + List an item
            </button>
            <button className="rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60">
              Browse listings
            </button>
            
            <span className="flex items-center gap-2 text-sm text-emerald-50/80">
              ⚡ No marketplace fees for students
            </span>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/10 p-4 text-left ring-1 ring-white/20">
                <p className="text-sm text-emerald-50/80">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 -top-8 h-24 w-24 rounded-full bg-white/20 blur-3xl" aria-hidden />
          <div className="absolute -left-12 bottom-6 h-24 w-24 rounded-full bg-emerald-300/20 blur-3xl" aria-hidden />

          <div className="glass-card relative overflow-hidden">
            <div className="bg-gradient-to-br from-white/90 to-white/70 px-6 pb-2 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Featured today</p>
                  <p className="text-xs text-slate-500">Verified student sellers</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Live
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-200/70">
              {featuredListings.map((item) => (
                <div key={item.title} className="flex gap-4 px-6 py-4 transition hover:bg-emerald-50/60">
                  <div className="h-20 w-24 overflow-hidden rounded-2xl ring-1 ring-slate-200/80">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tagColor}`}>
                        {item.tag}
                      </span>
                      <span className="text-xs text-slate-500">{item.meta}</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-emerald-600">{item.price}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>👤 {item.user}</span>
                      <span>⏱ {item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 text-sm text-slate-600">
              Trusted by thousands of students across campus. Join the loop →
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

