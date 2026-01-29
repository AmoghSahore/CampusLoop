const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="text-2xl font-extrabold text-white">
              ♻ Campus<span className="text-emerald-400">Loop</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Sustainable marketplace for students. Buy, sell, rent, or donate within your campus community and keep great gear in circulation.
            </p>
            <div className="flex gap-3 text-lg">
              <a href="#" className="rounded-full bg-slate-800 px-3 py-2 hover:text-emerald-300">✉️</a>
              <a href="#" className="rounded-full bg-slate-800 px-3 py-2 hover:text-emerald-300">📷</a>
              <a href="#" className="rounded-full bg-slate-800 px-3 py-2 hover:text-emerald-300">🐦</a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-emerald-300">Browse all</a></li>
              <li><a href="#" className="hover:text-emerald-300">List an item</a></li>
              <li><a href="#" className="hover:text-emerald-300">Wishlist</a></li>
              <li><a href="#" className="hover:text-emerald-300">Messages</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Categories</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-emerald-300">Books</a></li>
              <li><a href="#" className="hover:text-emerald-300">Electronics</a></li>
              <li><a href="#" className="hover:text-emerald-300">Lab equipment</a></li>
              <li><a href="#" className="hover:text-emerald-300">Furniture</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Support</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href="#" className="hover:text-emerald-300">Safety tips</a></li>
              <li><a href="#" className="hover:text-emerald-300">Community guidelines</a></li>
              <li><a href="#" className="hover:text-emerald-300">Help center</a></li>
              <li><a href="#" className="hover:text-emerald-300">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CampusLoop. For students, by students.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-emerald-300">Privacy</a>
            <a href="#" className="hover:text-emerald-300">Terms</a>
            <a href="#" className="hover:text-emerald-300">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

