import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import Navbar from './Navbar';
import Hero from './Hero';
import Stats from './Stats';
import Categories from './Categories';
import Listings from './Listings';
import Footer from './Footer';

const HomePage = () => {
  const [searchParams]   = useSearchParams();
  const searchQuery      = searchParams.get('search')   || '';
  const selectedCategory = searchParams.get('category') || '';
  const [showTop, setShowTop] = useState(false);

  // Scroll to listings section whenever search or category filter is applied
  useEffect(() => {
    if (searchQuery || selectedCategory) {
      const t = setTimeout(() => {
        document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return () => clearTimeout(t);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 450);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Categories />
        <Listings searchQuery={searchQuery} selectedCategory={selectedCategory} />
      </main>
      <Footer />

      {/* Floating back-to-top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[var(--primary-hover)] ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ChevronUp size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default HomePage;
